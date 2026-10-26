const ProductModel=require('../models/product.model')
const postProductData=async(req,res)=>{
    try{
        const data=req.body
        if(req.file){
            data.image=req.file.filename
        }
        const saved=new ProductModel(data)
        await saved.save()
        res.status(201).send({
            message:"product data added",
            data:saved
        })
    }
    catch(err){
  console.error("error in product data",err)
 res.status(500).send("error in posting")   
}
}
const getProductData=async(req,res)=>{
    try{
        const display=await ProductModel.find().sort({_id:-1})
           res.status(200).send({data:display}) 
    }
    catch(err){
         console.error("Error in get data:", err);
    res.status(500).send("Error retrieving products");
    }
}
module.exports={postProductData,getProductData}