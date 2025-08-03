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





// OTP vERFIFY
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID; // Verify Service SID
const client = twilio(accountSid, authToken);

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Helper function to format phone number
const formatPhoneNumber = (phone) => {
  // Convert to string if it's a number
  let phoneStr = phone.toString();
  
  // Remove all non-digits
  let cleaned = phoneStr.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned; // Add US country code
  }
  
  // Add + prefix
  return '+' + cleaned;
};

// 1. Send OTP via SMS for password reset
router.post('/forgot-password-sms', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Check if user exists with this phone number
    // Convert phone to number for database query
    const phoneNumber = parseInt(phone.replace(/\D/g, ''));
    const user = await User.findOne({ phoneno: phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this phone number' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate unique token for this OTP session
    const otpToken = crypto.randomBytes(32).toString('hex');
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(otpToken, {
      phone: formattedPhone,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      verified: false
    });

    // Send OTP via Twilio SMS
    try {
      await client.messages.create({
        body: `Your password reset OTP is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        to: formattedPhone
      });
    } catch (twilioError) {
      console.error('Twilio SMS error:', twilioError);
      return res.status(500).json({ error: 'Failed to send SMS. Please check your phone number.' });
    }

    res.status(200).json({ 
      message: 'OTP sent successfully',
      otpToken // Send token to frontend
    });

  } catch (error) {
    console.error('Forgot password SMS error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Alternative method using Twilio Verify Service (recommended for production)
router.post('/forgot-password-verify', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Check if user exists with this phone number
    // Convert phone to number for database query
    const phoneNumber = parseInt(phone.replace(/\D/g, ''));
    const user = await User.findOne({ phoneno: phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this phone number' });
    }

    // Generate unique token for this session
    const otpToken = crypto.randomBytes(32).toString('hex');
    
    // Store session info
    otpStore.set(otpToken, {
      phone: formattedPhone,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false
    });

    // Send OTP using Twilio Verify Service
    try {
      await client.verify.v2.services(serviceSid)
        .verifications
        .create({
          to: formattedPhone,
          channel: 'sms'
        });
    } catch (twilioError) {
      console.error('Twilio Verify error:', twilioError);
      return res.status(500).json({ error: 'Failed to send OTP. Please check your phone number.' });
    }

    res.status(200).json({ 
      message: 'OTP sent successfully',
      otpToken
    });

  } catch (error) {
    console.error('Forgot password verify error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// 2. Verify OTP (for manual SMS method)
router.post('/verify-otp-sms', async (req, res) => {
  try {
    const { phone, otp, otpToken } = req.body;

    if (!phone || !otp || !otpToken) {
      return res.status(400).json({ error: 'Phone, OTP, and token are required' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Get stored OTP data
    const storedData = otpStore.get(otpToken);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Invalid or expired OTP session' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(otpToken);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Verify OTP and phone
    if (storedData.phone !== formattedPhone || storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP or phone number' });
    }

    // Mark as verified
    storedData.verified = true;
    otpStore.set(otpToken, storedData);

    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Verify OTP SMS error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 2. Verify OTP (for Twilio Verify Service)
router.post('/verify-otp-verify', async (req, res) => {
  try {
    const { phone, otp, otpToken } = req.body;

    if (!phone || !otp || !otpToken) {
      return res.status(400).json({ error: 'Phone, OTP, and token are required' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Get stored session data
    const storedData = otpStore.get(otpToken);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }

    // Check if session expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(otpToken);
      return res.status(400).json({ error: 'Session has expired' });
    }

    // Verify phone matches
    if (storedData.phone !== formattedPhone) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    // Verify OTP using Twilio Verify Service
    try {
      const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({
          to: formattedPhone,
          code: otp
        });

      if (verificationCheck.status !== 'approved') {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (twilioError) {
      console.error('Twilio verification error:', twilioError);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark as verified
    storedData.verified = true;
    otpStore.set(otpToken, storedData);

    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Verify OTP verify error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 3. Reset password
router.post('/reset-password-sms', async (req, res) => {
  try {
    const { phone, newPassword, otpToken } = req.body;

    if (!phone || !newPassword || !otpToken) {
      return res.status(400).json({ error: 'Phone, new password, and token are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Get stored OTP data
    const storedData = otpStore.get(otpToken);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }

    // Check if OTP was verified
    if (!storedData.verified) {
      return res.status(400).json({ error: 'OTP not verified' });
    }

    // Check if session expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(otpToken);
      return res.status(400).json({ error: 'Session has expired' });
    }

    // Verify phone matches
    if (storedData.phone !== formattedPhone) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    // Find user by phone number (convert to number for database query)
    const phoneNumber = parseInt(phone.replace(/\D/g, ''));
    const user = await User.findOne({ phoneno: phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Clean up OTP session
    otpStore.delete(otpToken);

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password SMS error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(token);
    }
  }
}, 60000);

export default router;
