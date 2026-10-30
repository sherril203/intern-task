const mongoose=require('mongoose');
const AdminSchema=new mongoose.Schema({
    username:{type:String},
    email:{type:String},
    password:{type:String}
})
const adminModel=mongoose.model('admin',AdminSchema);
module.exports=adminModel