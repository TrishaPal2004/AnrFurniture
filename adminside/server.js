import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './config/db.js';
import heroRoutes from './Routes/heroRoutes.js';
import pdtRoutes from './Routes/pdtRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import carRoutes from './Routes/carRoutes.js'; // Importing the cart routes
import orderRoutes from './Routes/orderRoutes.js'
dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/hero', heroRoutes);
app.use('/api/pdt', pdtRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart',carRoutes); // Assuming you have a cartRoutes.js file
app.use('/api/order',orderRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
