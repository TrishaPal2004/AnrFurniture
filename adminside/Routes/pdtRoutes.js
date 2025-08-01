import  PdtSection from "../models/Product.js"; 
import express from 'express';
const router = express.Router();    
// GET all products
import mongoose from 'mongoose';
import authMiddleware from "../Middlewares/auth.js";
import adminMiddleware from "../Middlewares/admin.js";
router.get('/all', async (req, res) => {
  try {
    const products = await PdtSection.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// routes/products.js
// In your routes file, improve the search route:
// Fix your search route in the backend:
// Fix your search route:
// Corrected search route for your schema:
router.get('/q', async (req, res) => {
  try {
    const { q } = req.query;
    console.log("Search query received:", q);
    
    if (!q) {
      return res.json({ products: [] });
    }

    const searchQuery = q.trim();
    
    // Build search conditions based on your actual schema
    const searchConditions = [
      { name: { $regex: searchQuery, $options: 'i' } },
      { category: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { material: { $regex: searchQuery, $options: 'i' } },
      { size: { $regex: searchQuery, $options: 'i' } }
    ];

    // Add price search only if query is numeric
    const numericQuery = parseFloat(searchQuery);
    if (!isNaN(numericQuery)) {
      searchConditions.push(
        { price: { $gte: numericQuery - 100, $lte: numericQuery + 100 } },
        { price: numericQuery } // Exact match
      );
    }

    const products = await PdtSection.find({
      $or: searchConditions
    })
    .select('name category price images description material size quantity')
    .limit(10)
    .lean();

    console.log("Found products:", products.length);
    res.json({ products });
    
  } catch (error) {
    console.error('Search error details:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
});

// GET one product by ID
router.get('/:category', async (req, res) => {
  try {
    console.log("2nd")
    console.log("Fetching products for category:", req.params.category);
    const product = await PdtSection.find({ category: req.params.category });
    console.log(product);
    if (!product || product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }   
    res.json(product);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

//each pdt
router.get('/hi/:id', async (req, res) => {
  try {
    console.log("Fetching product by ID:", req.params.id);
    const id = req.params.id;
const objectId = new mongoose.Types.ObjectId(id); // ✅ This is fine

    const product = await PdtSection.findOne({ _id: objectId });
    console.log("Fetched Product:", product);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST to create a new product
router.post('/',authMiddleware,adminMiddleware, async (req, res) => {
  try {
    const newProduct = new PdtSection(req.body);
    console.log("Creating product:", newProduct);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.log('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});
// PUT to update a product by ID    
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await PdtSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
    } catch (err) {
         console.error('Error updating products:', err);
            res.status(500).json({ error: 'Failed to update product' });
    }
}); 
// DELETE a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await PdtSection
        .findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
        }
    res.json({ message: 'Product deleted successfully' });
    } catch (err) {
         console.error('Error deleting product:', err);
            res.status(500).json({ error: 'Failed to delete product' });
    }
});






export default router;