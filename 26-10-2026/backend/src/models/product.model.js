const mongoose=require('mongoose')
const ProductSchema=new mongoose.Schema(
    {
      image:{type:String}, 
      category:{type:String},
      product_title:{type:String},
      price:{type:String},
      original_price:{type:String}
    }
)
const ProductModel=mongoose.model('Product',ProductSchema)
module.exports=ProductModel