import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  sectionId: { type: String, required: true, unique: true }, // e.g., "hero1"
  imageUrl: String,
  h5: String,
  h1: String,
  p: String,
  buttonText: String
});

const HeroSection = mongoose.model('HeroSection', heroSchema);
export default HeroSection;
