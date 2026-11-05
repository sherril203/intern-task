const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    image: { type: String },
    category: { type: String },
    product_title: { type: String },
    price: { type: String },
    original_price: { type: String },
    brand: { type: String },
    quantity: { type: Number, default: 0 },
    status: { type: String, default: "out of stock" }
});

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = ProductModel;