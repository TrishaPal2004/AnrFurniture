// routes/cart.js
import express from "express";
import User from "../models/Users.js";
import authMiddleware from "../Middlewares/auth.js"; // Make sure this path is correct

const router = express.Router();

// GET /api/cart/items - Get all cart items for current user
router.get("/items", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.cart);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart/add - Add item to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const productData = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => (item.productId && item.productId.toString() === productData._id) || 
              (item._id && item._id.toString() === productData._id)
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      user.cart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      const cartItem = {
        productId: productData._id,
        _id: productData._id, // Keep both for compatibility
        name: productData.name,
        price: productData.price,
        quantity: 1,
        images: productData.images || [],
        material: productData.material,
        addedAt: new Date()
      };
      user.cart.push(cartItem);
    }
    
    await user.save();
    res.json({ 
      message: 'Item added to cart successfully', 
      cart: user.cart 
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/cart/update/:productId - Update item quantity
router.put("/update/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const itemIndex = user.cart.findIndex(item => 
      (item.productId && item.productId.toString() === productId) ||
      (item._id && item._id.toString() === productId)
    );
    
    if (itemIndex > -1) {
      if (quantity === 0) {
        // Remove item if quantity is 0
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = quantity;
      }
      await user.save();
      res.json({ 
        message: 'Cart updated successfully', 
        cart: user.cart 
      });
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: error.message });
  }
});


// GET /api/cart/check - Check if item exists in cart
router.get("/check", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const exists = user.cart.some(item => 
      (item.productId && item.productId.toString() === productId) ||
      (item._id && item._id.toString() === productId)
    );
    
    res.json({ exists });
  } catch (error) {
    console.error("Error checking cart:", error);
    res.status(500).json({ message: error.message });
  }
});
//remove particular pdt
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    console.log("Removng item with product Id",productId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const removedItems = user.cart.filter(item =>
  item.productId === productId || item._id === productId
);

user.cart = user.cart.filter(item =>
  item.productId !== productId &&
  item._id !== productId
);

if (removedItems.length === 0) {
  return res.status(404).json({ message: 'Item not found in cart' });
}

    await user.save();
    res.json({ 
      message: 'Item removed from cart successfully', 
      cart: user.cart 
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: error.message });
  }
});


// GET /api/cart/count - Get cart items count
router.get("/count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const count = user.cart.reduce((total, item) => total + item.quantity, 0);
    res.json({ count });
  } catch (error) {
    console.error("Error getting cart count:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;