
const CartModel = require('../models/Cart.model');

// GET USER CART
const getCartData = async (req, res) => {
    try {
        const userId = req.user.id;

        const products = await CartModel.find({
            userId: userId
        }).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({
            message: error.message
        });
    }
};

// ADD TO CART
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

// REMOVE FROM CART
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
