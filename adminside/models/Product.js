import mongoose from 'mongoose'

const PdtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },    
    images: { type: [String], required: true },
    date:{type:Date,default:Date.now},
    material: { type: String, required: true },
    size:{type: String, required: true },
    quantity:{type:Number,required:false},
    minorderquantity:{type:Number,default:1} 
})

const PdtSection = mongoose.model('PdtSection', PdtSchema);
export default PdtSection ;
