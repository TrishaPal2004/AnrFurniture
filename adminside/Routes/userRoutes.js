import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import authMiddleware from "../Middlewares/auth.js";
import adminMiddleware from "../Middlewares/admin.js";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey"; // Add this in .env

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

export default router;
