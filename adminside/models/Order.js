import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    quantity: { 
        type: Number, 
        default: 1, 
        min: 1 
    },
    images: { 
        type: [String], 
        required: true 
    },
    material: {
        type: String,
        required: false // Made optional since not all products may have this
    }
});

// Main order schema
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        
        unique: true,
        default: () => 'OD' + Date.now() + Math.random().toString(36).substr(2, 5)
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userPhone: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
     items: {
    type: [orderItemSchema], 
    required: true
  },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery']
    },
    orderStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    estimatedDelivery: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Virtual for calculating total items count
orderSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate order savings (if you track original prices)
orderSchema.methods.calculateSavings = function() {
    return this.items.reduce((savings, item) => {
        const originalPrice = item.originalPrice || item.price * 1.2;
        return savings + ((originalPrice - item.price) * item.quantity);
    }, 0);
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ userId }).sort({ orderDate: -1 });
};

// Pre-save middleware to ensure deliveryAddress is set from location
orderSchema.pre('save', function(next) {
    if (!this.deliveryAddress && this.location) {
        this.deliveryAddress = this.location;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;