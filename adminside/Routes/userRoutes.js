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






import nodemailer from 'nodemailer'

console.log('Email Service Config Check:');
console.log('Email Host:', process.env.EMAIL_HOST ? 'Set' : 'Missing');
console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Missing');
console.log('Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Missing');

// Configure nodemailer transporter
let transporter;
try {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use app password for Gmail
      },
    });
    console.log('Email transporter initialized successfully');
  } else {
    console.error('Email credentials missing!');
  }
} catch (error) {
  console.error('Failed to initialize email transporter:', error);
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to format expiry time
const formatExpiryTime = (date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to send OTP email
const sendOTPEmail = async (email, otp, expiryTime) => {
  const mailOptions = {
    from: {
      name: 'ANR Furniture',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Password Reset OTP - ANR Furniture',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">ANR Furniture</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Password Reset Request</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            To authenticate, please use the following One Time Password (OTP):
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #00ffff; color: black; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; display: inline-block; font-family: monospace; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            This OTP will be valid for 15 minutes till <strong>${expiryTime}</strong>.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email. ANR Furniture will never contact you about this email or ask for any login codes or links. Beware of phishing scams.
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Thanks for visiting ANR Furniture!
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// 1. Send OTP via Email for password reset
router.post('/forgot-password-email', async (req, res) => {
  try {
    console.log('=== FORGOT PASSWORD EMAIL REQUEST ===');
    console.log('Request body:', req.body);
    
    const { email } = req.body;

    if (!email) {
      console.log('Error: Email address missing');
      return res.status(400).json({ error: 'Email address is required' });
    }

    if (!isValidEmail(email)) {
      console.log('Error: Invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check email transporter
    if (!transporter) {
      console.log('Error: Email transporter not initialized');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    console.log('Looking for user with email:', email);
    
    // Check if user exists with this email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('Error: User not found with email:', email);
      return res.status(404).json({ error: 'User not found with this email address' });
    }
    
    console.log('User found:', user.name, user.email);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    
    // Generate unique token for this OTP session
    const otpToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated OTP token:', otpToken);
    
    // Set expiry time (15 minutes)
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    
    // Store OTP with expiration
    otpStore.set(otpToken, {
      email: email.toLowerCase(),
      otp,
      expiresAt: expiryTime.getTime(),
      verified: false,
      userId: user._id
    });
    
    console.log('OTP stored in memory');

    // Send OTP via Email
    try {
      console.log('Attempting to send email...');
      console.log('To:', email);
      console.log('OTP:', otp);
      
      const emailResult = await sendOTPEmail(email, otp, formatExpiryTime(expiryTime));
      
      console.log('Email sent successfully! Message ID:', emailResult.messageId);
      
    } catch (emailError) {
      console.error('=== EMAIL SENDING ERROR ===');
      console.error('Error message:', emailError.message);
      console.error('Error code:', emailError.code);
      console.error('Full error:', emailError);
      
      // Return specific email error
      let errorMessage = 'Failed to send email';
      if (emailError.code === 'EAUTH') {
        errorMessage = 'Email authentication failed';
      } else if (emailError.code === 'ECONNECTION') {
        errorMessage = 'Email service connection failed';
      } else if (emailError.message) {
        errorMessage = emailError.message;
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        details: emailError.message
      });
    }

    console.log('Email operation completed successfully');
    res.status(200).json({ 
      message: 'OTP sent successfully to your email',
      otpToken,
      debug: {
        email: email.toLowerCase(),
        userFound: true,
        expiresAt: formatExpiryTime(expiryTime)
      }
    });

  } catch (error) {
    console.error('=== GENERAL ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.message,
      type: error.name
    });
  }
});

// 2. Verify OTP
router.post('/verify-otp-email', async (req, res) => {
  try {
    console.log('=== VERIFY OTP EMAIL REQUEST ===');
    console.log('Request body:', req.body);
    
    const { email, otp, otpToken } = req.body;

    if (!email || !otp || !otpToken) {
      return res.status(400).json({ error: 'Email, OTP, and token are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get stored OTP data
    const storedData = otpStore.get(otpToken);
    console.log('Stored OTP data:', storedData);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Invalid or expired OTP session' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(otpToken);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    const normalizedEmail = email.toLowerCase();
    
    // Verify OTP and email
    if (storedData.email !== normalizedEmail || storedData.otp !== otp) {
      console.log('OTP verification failed:');
      console.log('Expected email:', storedData.email);
      console.log('Received email:', normalizedEmail);
      console.log('Expected OTP:', storedData.otp);
      console.log('Received OTP:', otp);
      return res.status(400).json({ error: 'Invalid OTP or email address' });
    }

    // Mark as verified
    storedData.verified = true;
    otpStore.set(otpToken, storedData);

    console.log('OTP verified successfully');
    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Verify OTP Email error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 3. Reset password
router.post('/reset-password-email', async (req, res) => {
  try {
    console.log('=== RESET PASSWORD EMAIL REQUEST ===');
    console.log('Request body:', req.body);
    
    const { email, newPassword, otpToken } = req.body;
    
    console.log("Email is",email);
    console.log("NewPassword", newPassword);
    console.log("OTP Token",otpToken);
    if (!email || !newPassword || !otpToken) {
      return res.status(400).json({ error: 'Email, new password, and token are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Get stored OTP data
    const storedData = otpStore.get(otpToken);
    console.log('Stored data for password reset:', storedData);
    
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

    const normalizedEmail = email.toLowerCase();
    
    // Verify email matches
    if (storedData.email !== normalizedEmail) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
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

    console.log('Password reset successfully for user:', user.email);
    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password Email error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Debug endpoint to check configuration
router.get('/debug-email-config', (req, res) => {
  res.json({
    emailConfigured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS),
    emailHostSet: !!process.env.EMAIL_HOST,
    emailUserSet: !!process.env.EMAIL_USER,
    emailPassSet: !!process.env.EMAIL_PASS,
    emailHost: process.env.EMAIL_HOST,
    emailUser: process.env.EMAIL_USER,
    otpStoreSize: otpStore.size
  });
});

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(token);
      console.log('Cleaned up expired OTP for:', data.email);
    }
  }
}, 60000); // Run every minute


export default router;
