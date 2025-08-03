import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import authMiddleware from "../Middlewares/auth.js";
import adminMiddleware from "../Middlewares/admin.js";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey"; // Add this in .env
import twilio from 'twilio';
import crypto from 'crypto';

// ✅ POST /signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phoneno, password } = req.body;
    let role="user";
    if(email==="rahul@anr.in" || email==="ayan@anr.in")
      role="admin";
   
    console.log("Creating user:", { name, email, phoneno,role });
    console.log(password);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phoneno, password: hashedPassword,role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneno: newUser.phoneno,
        role:newUser.role
      },
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ✅ POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Logging in user with email:", email);

    let token;
    

     
    
    // Handle normal user login
    const user = await User.findOne({ email }).select("+password");

     console.log("Password : ",user.password);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role:user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneno: user.phoneno,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
});


 router.post("/:id/cart", authMiddleware, async (req, res) => {
  console.log("Adding to cart endpoint hit");
  try {
    const { productId, name, price, images, material, quantity, minorderquantity } = req.body; // Get minorderquantity from req.body
    const userId = req.user.id;

    console.log("Adding to cart:", productId, name, price, images, material, quantity, minorderquantity);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingItem = user.cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      return res.status(409).json({ error: "Product already in cart" });
    }

    user.cart.push({
      productId,
      name,
      price,
      images,
      material,
      quantity: minorderquantity, // Use minimum quantity as default
      minorderquantity: minorderquantity || 1 // Store the minimum order quantity
    });

    await user.save();
    res.status(200).json({ message: "Product added to cart", cart: user.cart });
    
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add product to cart" });
  }
});

//get all usets
router.post('/all',authMiddleware,adminMiddleware, async (req, res) => {
  console.log("back");
  try {
    const users = await User.find({}, { password: 0 }); // don't return password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});





// // OTP vERFIFY
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// console.log('Twilio Config Check:');
// console.log('Account SID:', accountSid ? 'Set' : 'Missing');
// console.log('Auth Token:', authToken ? 'Set' : 'Missing');
// console.log('Phone Number:', twilioPhoneNumber ? twilioPhoneNumber : 'Missing');

// let client;
// try {
//   if (accountSid && authToken) {
//     client = twilio(accountSid, authToken);
//     console.log('Twilio client initialized successfully');
//   } else {
//     console.error('Twilio credentials missing!');
//   }
// } catch (error) {
//   console.error('Failed to initialize Twilio client:', error);
// }

// // Store OTPs temporarily (in production, use Redis or database)
// const otpStore = new Map();

// // Helper function to format phone number
// const formatPhoneNumber = (phone) => {
//   try {
//     // Convert to string if it's a number
//     let phoneStr = phone.toString();
    
//     // Remove all non-digits
//     let cleaned = phoneStr.replace(/\D/g, '');
    
//     console.log('Formatting phone:', phone, '-> cleaned:', cleaned);
    
//     // Add country code if not present
//     if (cleaned.length === 10) {
//       cleaned = '1' + cleaned; // Add US country code
//     }
    
//     // Add + prefix
//     const formatted = '+' + cleaned;
//     console.log('Final formatted phone:', formatted);
//     return formatted;
//   } catch (error) {
//     console.error('Error formatting phone number:', error);
//     throw new Error('Invalid phone number format');
//   }
// };

// // 1. Send OTP via SMS for password reset
// router.post('/forgot-password-sms', async (req, res) => {
//   try {
//     console.log('=== FORGOT PASSWORD SMS REQUEST ===');
//     console.log('Request body:', req.body);
    
//     const { phone } = req.body;

//     if (!phone) {
//       console.log('Error: Phone number missing');
//       return res.status(400).json({ error: 'Phone number is required' });
//     }

//     // Check Twilio client
//     if (!client) {
//       console.log('Error: Twilio client not initialized');
//       return res.status(500).json({ error: 'SMS service not configured' });
//     }

//     if (!twilioPhoneNumber) {
//       console.log('Error: Twilio phone number not configured');
//       return res.status(500).json({ error: 'SMS service phone number not configured' });
//     }

//     const formattedPhone = formatPhoneNumber(phone);
//     console.log('Formatted phone for Twilio:', formattedPhone);

//     // Check if user exists with this phone number
//     // Convert phone to number for database query
//     const phoneNumber = parseInt(phone.toString().replace(/\D/g, ''));
//     console.log('Looking for user with phone number:', phoneNumber);
    
//     const user = await User.findOne({ phoneno: phoneNumber });
//     if (!user) {
//       console.log('Error: User not found with phone:', phoneNumber);
//       return res.status(404).json({ error: 'User not found with this phone number' });
//     }
    
//     console.log('User found:', user.name, user.email);

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log('Generated OTP:', otp);
    
//     // Generate unique token for this OTP session
//     const otpToken = crypto.randomBytes(32).toString('hex');
//     console.log('Generated OTP token:', otpToken);
    
//     // Store OTP with expiration (5 minutes)
//     otpStore.set(otpToken, {
//       phone: formattedPhone,
//       originalPhone: phoneNumber,
//       otp,
//       expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
//       verified: false
//     });
    
//     console.log('OTP stored in memory');

//     // Send OTP via Twilio SMS
//     try {
//       console.log('Attempting to send SMS...');
//       console.log('From:', twilioPhoneNumber);
//       console.log('To:', formattedPhone);
//       console.log('Message: OTP:', otp);
      
//       const message = await client.messages.create({
//         body: `Your password reset OTP is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`,
//         from: twilioPhoneNumber,
//         to: formattedPhone
//       });
      
//       console.log('SMS sent successfully! Message SID:', message.sid);
//       console.log('Message status:', message.status);
      
//     } catch (twilioError) {
//       console.error('=== TWILIO SMS ERROR ===');
//       console.error('Error code:', twilioError.code);
//       console.error('Error message:', twilioError.message);
//       console.error('More info:', twilioError.moreInfo);
//       console.error('Status:', twilioError.status);
//       console.error('Full error:', twilioError);
      
//       // Return specific Twilio error
//       let errorMessage = 'Failed to send SMS';
//       if (twilioError.code === 21211) {
//         errorMessage = 'Invalid phone number format';
//       } else if (twilioError.code === 21614) {
//         errorMessage = 'Phone number not verified (trial account)';
//       } else if (twilioError.code === 21408) {
//         errorMessage = 'Permission denied - check Twilio credentials';
//       } else if (twilioError.message) {
//         errorMessage = twilioError.message;
//       }
      
//       return res.status(500).json({ 
//         error: errorMessage,
//         twilioCode: twilioError.code,
//         details: twilioError.message
//       });
//     }

//     console.log('SMS operation completed successfully');
//     res.status(200).json({ 
//       message: 'OTP sent successfully',
//       otpToken,
//       debug: {
//         formattedPhone,
//         originalPhone: phoneNumber,
//         userFound: true
//       }
//     });

//   } catch (error) {
//     console.error('=== GENERAL ERROR ===');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
    
//     res.status(500).json({ 
//       error: 'Failed to send OTP',
//       details: error.message,
//       type: error.name
//     });
//   }
// });

// // 2. Verify OTP
// router.post('/verify-otp-sms', async (req, res) => {
//   try {
//     console.log('=== VERIFY OTP REQUEST ===');
//     console.log('Request body:', req.body);
    
//     const { phone, otp, otpToken } = req.body;

//     if (!phone || !otp || !otpToken) {
//       return res.status(400).json({ error: 'Phone, OTP, and token are required' });
//     }

//     // Get stored OTP data
//     const storedData = otpStore.get(otpToken);
//     console.log('Stored OTP data:', storedData);
    
//     if (!storedData) {
//       return res.status(400).json({ error: 'Invalid or expired OTP session' });
//     }

//     // Check if OTP expired
//     if (Date.now() > storedData.expiresAt) {
//       otpStore.delete(otpToken);
//       return res.status(400).json({ error: 'OTP has expired' });
//     }

//     const phoneNumber = parseInt(phone.toString().replace(/\D/g, ''));
    
//     // Verify OTP and phone
//     if (storedData.originalPhone !== phoneNumber || storedData.otp !== otp) {
//       console.log('OTP verification failed:');
//       console.log('Expected phone:', storedData.originalPhone);
//       console.log('Received phone:', phoneNumber);
//       console.log('Expected OTP:', storedData.otp);
//       console.log('Received OTP:', otp);
//       return res.status(400).json({ error: 'Invalid OTP or phone number' });
//     }

//     // Mark as verified
//     storedData.verified = true;
//     otpStore.set(otpToken, storedData);

//     console.log('OTP verified successfully');
//     res.status(200).json({ message: 'OTP verified successfully' });

//   } catch (error) {
//     console.error('Verify OTP SMS error:', error);
//     res.status(500).json({ error: 'Failed to verify OTP' });
//   }
// });

// // 3. Reset password
// router.post('/reset-password-sms', async (req, res) => {
//   try {
//     console.log('=== RESET PASSWORD REQUEST ===');
//     console.log('Request body:', req.body);
    
//     const { phone, newPassword, otpToken } = req.body;

//     if (!phone || !newPassword || !otpToken) {
//       return res.status(400).json({ error: 'Phone, new password, and token are required' });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }

//     // Get stored OTP data
//     const storedData = otpStore.get(otpToken);
//     console.log('Stored data for password reset:', storedData);
    
//     if (!storedData) {
//       return res.status(400).json({ error: 'Invalid or expired session' });
//     }

//     // Check if OTP was verified
//     if (!storedData.verified) {
//       return res.status(400).json({ error: 'OTP not verified' });
//     }

//     // Check if session expired
//     if (Date.now() > storedData.expiresAt) {
//       otpStore.delete(otpToken);
//       return res.status(400).json({ error: 'Session has expired' });
//     }

//     const phoneNumber = parseInt(phone.toString().replace(/\D/g, ''));
    
//     // Verify phone matches
//     if (storedData.originalPhone !== phoneNumber) {
//       return res.status(400).json({ error: 'Invalid session' });
//     }

//     // Find user by phone number
//     const user = await User.findOne({ phoneno: phoneNumber });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Hash new password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update user password
//     await User.findByIdAndUpdate(user._id, { password: hashedPassword });

//     // Clean up OTP session
//     otpStore.delete(otpToken);

//     console.log('Password reset successfully for user:', user.email);
//     res.status(200).json({ message: 'Password reset successfully' });

//   } catch (error) {
//     console.error('Reset password SMS error:', error);
//     res.status(500).json({ error: 'Failed to reset password' });
//   }
// });

// // Debug endpoint to check configuration
// router.get('/debug-config', (req, res) => {
//   res.json({
//     twilioConfigured: !!(accountSid && authToken && twilioPhoneNumber),
//     accountSidSet: !!accountSid,
//     authTokenSet: !!authToken,
//     phoneNumberSet: !!twilioPhoneNumber,
//     phoneNumber: twilioPhoneNumber,
//     otpStoreSize: otpStore.size
//   });
// });

// // Clean up expired OTPs periodically
// setInterval(() => {
//   const now = Date.now();
//   for (const [token, data] of otpStore.entries()) {
//     if (now > data.expiresAt) {
//       otpStore.delete(token);
//     }
//   }
// }, 60000);
export default router;
