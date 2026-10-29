const tokengenerator = require('../Middleware/Auth')
const AdminModel=require('../models/Admin.model')
const bcrypt=require('bcrypt')

const AdminRegister=async(req,res)=>{
    try{
        const {email,password}=req.body
        const existdata=await AdminModel.findOne({email})
        if (existdata){
            return res.status(400).send({message:"admin not registered"})
        }

    const hashedPassword = await bcrypt.hash(admindata.password, 10);
    admindata.password = hashedPassword;

    const savedUser = new AdminModel(admindata);
    await savedUser.save();

    return res.status(201).send({ message: "Admin registered successfully" });
    }
    catch(err){
        return res.status(400).send({message:"sign up failed"})
    }
}
const Adminlogin=async(req,res)=>{
    try{
        const admindata=req.body
        const existdata=await AdminModel.findOne({email:admindata.email})
        if (!existdata){
            return res.status(400).send({message:"admin not registered"})
        }
           const matchedPassword=await bcrypt.compare(password,existdata.password)
       if (!matchedPassword) {
      return res.status(401).send({ message: "Invalid password" });
    }
        const token=tokengenerator(existdata._id)
        return res.status(200).send({message:"admin login",data:{token}})
    }  
    catch(err){
        return res.status(400).send({message:"login failed"})
    }
}
module.exports={AdminRegister,Adminlogin}