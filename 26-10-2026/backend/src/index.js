const mongoose=require('mongoose')
const server=require('./app')
require('dotenv').config()

const mongodb_uri=process.env.MONGODB_URI
const port=process.env.port || 5000;
if(!mongodb_uri){
    console.error("mongodb uri missing")
}
mongoose.connect(mongodb_uri)
.then(()=>{
    console.log('mongodb connected')
    server.listen(port,()=>{
        console.log(` Server running on port ${port}`);
    })
}
)
 .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });