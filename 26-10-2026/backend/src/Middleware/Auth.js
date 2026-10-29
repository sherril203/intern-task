const jwt=require('jsonwebtoken')
require('dotenv').config()
const jwt_secret=process.env.jwt_secret
const tokengenerator=(id)=>{
    const token=jwt.sign({id:id},jwt_secret,{expiresIn:"1h"})
    return token
}
module.exports=tokengenerator