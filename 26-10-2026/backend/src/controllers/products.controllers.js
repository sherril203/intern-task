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
const updateProductData = async (req, res) => {
    try {
        const id = req.params.id;

        const update = {
            product_title: req.body.product_title,
            category: req.body.category,
            price: req.body.price,
            original_price: req.body.original_price,
            brand: req.body.brand
        };

        if (req.file) {
            update.image = req.file.filename;
        }

        const updated = await ProductModel.findByIdAndUpdate(
            id,
            { $set: update },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            data: updated
        });

    } catch (err) {
        console.error("Update Product Error:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

const deleteProductdata=async(req,res)=>{
   try {
    const id = req.params.id;

    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send({ message: "Error deleting product" });
  }
}
module.exports={postProductData,getProductData,
    updateProductData,deleteProductdata}