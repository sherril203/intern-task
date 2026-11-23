
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    image: {
        type: String
    },
    category: {
        type: String
    },
    product_title: {
        type: String
    },
    price: {
        type: String
    },
    original_price: {
        type: String
    },
    brand: {
        type: String
    }
});

const CartModel = mongoose.model('Cart', CartSchema);

module.exports = CartModel;
