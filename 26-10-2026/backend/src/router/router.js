const express = require('express');
const router = express.Router();
const Productdata=require('../controllers/products.controllers')
const Contactform=require('../controllers/contact.controllers')
const upload=require('../utils/fileStorage')
const Cartdata=require('../controllers/Cart.controllers')
const Admin=require('../controllers/Admin.controlers')
const verifyToken = require("../Middleware/verifyToken");
//products
router.post('/postdata', verifyToken,upload.single('image'),Productdata.postProductData)
router.get('/alldata',Productdata.getProductData)
router.put('/updatedata/:id', verifyToken, upload.single('image'),Productdata.updateProductData);
router.delete('/deletedata/:id', verifyToken, Productdata.deleteProductdata);
router.get('/product/:id', Productdata.getProductById);
//cart
router.get('/cart',Cartdata.getCartData)
router.post("/cart", Cartdata.addToCart);
router.delete("/cart/:id", Cartdata.removeCart);
//admin
router.post('/adminRegister',Admin.AdminRegister);
router.post('/adminLogin',Admin.Adminlogin)

//contact
router.post('/contact',Contactform.postContact);
module.exports=router