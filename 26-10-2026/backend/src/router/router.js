const express = require('express');
const router = express.Router();
const Productdata=require('../controllers/products.controllers')
const upload=require('../utils/fileStorage')
const Cartdata=require('../controllers/Cart.controllers')

router.post('/postdata',upload.single('image'),Productdata.postProductData)
router.get('/alldata',Productdata.getProductData)
router.get('/cart',Cartdata.getCartData)
router.post("/cart", Cartdata.addToCart);
router.delete("/cart/:id", Cartdata.removeCart);
module.exports=router