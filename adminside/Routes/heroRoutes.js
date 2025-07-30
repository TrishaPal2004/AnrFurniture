import adminMiddleware from '../Middlewares/admin.js';
import authMiddleware from '../Middlewares/auth.js';
import HeroSection from '../models/Hero.js';
import express from 'express';
const router = express.Router();

// GET all hero sections (return as key-value pairs)
router.get('/', async (req, res) => {
  try {
    // Set proper JSON headers 
    res.setHeader('Content-Type', 'application/json');
    
    const sections = await HeroSection.find();
    const formatted = {};
    
    sections.forEach(section => {
      formatted[section.sectionId] = section.toObject();
      delete formatted[section.sectionId]._id;
      delete formatted[section.sectionId].__v;
    });
    
    // If no sections exist, return default structure
    if (Object.keys(formatted).length === 0) {
      const defaultData = {
        hero1: { imageUrl: '', h5: '', h1: '', p: '', buttonText: '' },
        hero2: { imageUrl: '', h5: '', h1: '', p: '', buttonText: '' },
        hero3: { imageUrl: '', h5: '', h1: '', p: '', buttonText: '' }
      };
      return res.json(defaultData);
    }
    
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching sections:', err);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// GET one section (e.g., hero1)
router.get('/:sectionId',  async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const section = await HeroSection.findOne({ sectionId: req.params.sectionId });
    console.log("Fetching section:", req.params.sectionId);
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json(section);
  } catch (err) {
    console.error('Error fetching section:', err);
    res.status(500).json({ error: 'Error fetching section' });
  }
});

// PUT to update a section
router.put('/:sectionId',authMiddleware,adminMiddleware,  async (req, res) => {
  console.log("Updating section:", req.params.sectionId);
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const section = await HeroSection.findOneAndUpdate(
      { sectionId: req.params.sectionId },
      { ...req.body, sectionId: req.params.sectionId }, // Ensure sectionId is set
      { new: true, upsert: true }
    );
    
    console.log("Section updated:", section);
    res.json(section);
  } catch (err) {
    console.error('Error updating section:', err);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

export default router;