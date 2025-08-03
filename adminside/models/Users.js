import mongoose from "mongoose";

// Define cart item schema for better structure
const cartItemSchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true 
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    minorderquantity:{type:Number,default:1},
    images:  { type: [String], required: true }, // Array of image URLs
    material: {type:String,required:true},
    addedAt: { type: Date, default: Date.now }
}, { _id: false }); // _id: false prevents MongoDB from creating _id for subdocuments

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneno: { type: Number, required: true },
    password:{type:String,required:true},
    address: { type: String, required: false },
    role: { type: String, required:false },
    cart: [cartItemSchema], // Array of structured cart items
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Add index for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ "cart.productId": 1 });

const User = mongoose.model("User", userSchema);
export default User;