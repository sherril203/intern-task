const express=require('express')
const cors=require('cors')
const path=require('path')
const router=require('./router/router')
const app=express()

app.use(cors())
app.use(express.json())
app.use('/files',express.static(path.join(__dirname,'image')))
app.get("/",(req,res)=>{
    res.send("api is working")
})
app.use(router)

module.exports=app