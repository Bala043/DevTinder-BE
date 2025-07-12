const mongoose=require("mongoose")
const connectDb=async()=>{
await mongoose.connect("mongodb+srv://bala043:24H52558N86SDoNE@cluster.t4qv28l.mongodb.net/TinderDb")
}
module.exports={connectDb}