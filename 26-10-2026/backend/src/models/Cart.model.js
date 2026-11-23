const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: String,
    category: String,
    product_title: String,
    price: String,
    original_price: String,
    brand: String
});

module.exports = mongoose.model("Cart", CartSchema);