// routes/orders.js
import express from 'express';
import Order from '../models/Order.js'; // Adjust path to your Order model
import authMiddleware from '../Middlewares/auth.js';
import adminMiddleware from '../Middlewares/admin.js';
import PdtSection from '../models/Product.js';
// import { authenticateToken } from '../Middleware/auth.js'; // Your auth middleware

const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const products = await Order.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create a new order
router.post('/create', async (req, res) => {
  console.log("Hello there!");
  try {
    const {
      userId,
      userName,
      userPhone,
      location,
      deliveryAddress,
      items,
      totalAmount,
      paymentMethod
    } = req.body;

    // Validation
    if (!userId || !userName || !userPhone || !location || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || !item.price || !item.quantity || !item.images) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId, name, price, quantity, and images'
        });
      }
    }

    // Validate payment method
    const validPaymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Generate unique order ID
    const orderId = 'OD' + Date.now() + Math.random().toString(36).substr(2, 5);

    // Create order
    const newOrder = new Order({
      orderId,
      userId,
      userName,
      userPhone,
      location,
      deliveryAddress: deliveryAddress || location,
      items,
      totalAmount,
      paymentMethod,
      orderStatus: 'Pending'
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder.orderId,
      orderStatus: savedOrder.orderStatus,
      estimatedDelivery: savedOrder.estimatedDelivery,
      order: savedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { userId };
    if (status) {
      query.orderStatus = status;
    }

    // Execute query with pagination
    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get single order by ID
router.get('/:orderId',  async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order (for security)
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Update order status (admin only - add admin middleware as needed)
router.patch('/:orderId/status', async (req, res) => {
  try {
    const orderId = req.params.orderId.trim();
    const { orderStatus } = req.body;
    console.log("hii", orderStatus);
    
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { orderStatus },
      { new: true }
    );
    
    console.log("Updated order:", order);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Reduce product quantities when order is delivered
    if (orderStatus === 'Delivered') {
      console.log("Processing delivered order - updating quantities");
      
      // Loop through order items (adjust based on your order structure)
      for (const item of order.items) { // or order.products
        console.log(`Updating product ${item.productId} - reducing by ${item.quantity}`);
        
        const updatedProduct = await Product.findByIdAndUpdate(
          item.productId, // Make sure this matches your product ID field
          { $inc: { quantity: -item.quantity } }, // Reduce quantity
          { new: true }
        );
        
        console.log(`Product updated:`, updatedProduct);
        
        // Optional: Check if quantity goes below 0
        if (updatedProduct && updatedProduct.quantity < 0) {
          console.warn(`Warning: Product ${item.productId} quantity is now negative: ${updatedProduct.quantity}`);
        }
      }
      
      console.log('All product quantities updated for delivered order');
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Cancel order (user can cancel pending orders)
router.patch('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    if(order.orderStatus=="Delivered")
      await updateProductQuantitiesIfDelivered(order._id);
    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});


router.post('/track', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // assuming auth middleware sets req.user
    const orders = await Order.find({ userId }); // Find all orders by user

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error in /track:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


//update pdt quantity on being delivered
const updateProductQuantitiesIfDelivered = async (orderId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found");
      return;
    }

    if (order.orderStatus !== "Delivered") {
      console.log("Order is not delivered yet.");
      return;
    }

    for (const item of order.items) {
      const product = await PdtSection.findById(item.productId);

      if (product) {
        const oldQuantity = product.quantity || 0;
        const newQuantity = Math.max(0, oldQuantity - item.quantity);

        product.quantity = newQuantity;
        await product.save();

        console.log(
          `Updated ${product.name}: ${oldQuantity} → ${newQuantity}`
        );
      } else {
        console.log(`Product not found: ${item.productId}`);
      }
    }

  } catch (error) {
    console.error("Error updating product quantities:", error);
  }
};
export default router;