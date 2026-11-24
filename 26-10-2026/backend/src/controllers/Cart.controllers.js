
const CartModel = require("../models/Cart.model");

// GET LOGGED-IN USER'S CART
const getCartData = async (req, res) => {
    try {
        const products = await CartModel.find({
            userId: req.user.id
        }).sort({ _id: -1 });

        return res.status(200).json({
            data: products
        });

    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({
            message: error.message
        });
    }
};

// ADD PRODUCT TO CART
const addToCart = async (req, res) => {
    try {
        const {
            image,
            category,
            product_title,
            price,
            original_price,
            brand
        } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Invalid user token"
            });
        }

        const cartItem = await CartModel.create({
            userId: req.user.id,
            image,
            category,
            product_title,
            price,
            original_price,
            brand
        });

        return res.status(201).json({
            message: "Product added to cart",
            data: cartItem
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({
            message: error.message
        });
    }
};

// REMOVE PRODUCT FROM LOGGED-IN USER'S CART
const removeCart = async (req, res) => {
    try {
        const product = await CartModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product removed successfully"
        });

    } catch (error) {
        console.error("Remove cart error:", error);
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getCartData,
    addToCart,
    removeCart
};
