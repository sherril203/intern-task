const express = require('express');
const router = express.Router();
const Productdata=require('../controllers/products.controllers')
const upload=require('../utils/fileStorage')

router.post('/postdata',upload.single('image'),Productdata.postProductData)
router.get('/alldata',Productdata.getProductData)

module.exports=router