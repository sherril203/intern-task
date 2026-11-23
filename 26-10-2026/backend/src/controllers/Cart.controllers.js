
const CartModel = require('../models/Cart.model');

// GET USER CART
const getCartData = async (req, res) => {
    try {
        const products = await CartModel.find({
            userId: req.user._id
        }).sort({ _id: -1 });

        res.status(200).json({
            data: products
        });

    } catch (error) {
        res.status(500).json({
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
            userId: req.user.id, // Important
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
        return res.status(500).json({ message: error.message });
    }
};


// REMOVE FROM CART
const removeCart = async (req, res) => {
    try {
        const product = await CartModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Product removed successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getCartData,
    addToCart,
    removeCart
};
