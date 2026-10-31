const express = require('express');
const router = express.Router();
const Productdata=require('../controllers/products.controllers')
const upload=require('../utils/fileStorage')
const Cartdata=require('../controllers/Cart.controllers')
const Admin=require('../controllers/Admin.controlers')
//products
router.post('/postdata',upload.single('image'),Productdata.postProductData)
router.get('/alldata',Productdata.getProductData)
router.put('/updatedata/:id', upload.single('image'),Productdata.updateProductData);
router.delete('/deletedata/:id', Productdata.deleteProductdata);
//cart
router.get('/cart',Cartdata.getCartData)
router.post("/cart", Cartdata.addToCart);
router.delete("/cart/:id", Cartdata.removeCart);
//admin
router.post('/adminRegister',Admin.AdminRegister);
router.post('/adminLogin',Admin.Adminlogin)
module.exports=router