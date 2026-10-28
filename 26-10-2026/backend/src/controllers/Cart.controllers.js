
const CartModel = require("../models/Cart.model");

// Get cart products
const getCartData = async (req, res) => {
    try {
        const products = await CartModel.find().sort({ _id: -1 });
        res.status(200).json({ data: products });
    } catch (error) {
        console.log("Get cart error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const product = await CartModel.create(req.body);

        res.status(201).json({
            message: "Product added to cart",
            data: product
        });
    } catch (error) {
        console.log("Add cart error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Remove product from cart
const removeCart = async (req, res) => {
    try {
        const product = await CartModel.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product removed"
        });
    } catch (error) {
        console.log("Remove cart error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCartData, addToCart, removeCart };
