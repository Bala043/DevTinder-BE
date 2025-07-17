const express=require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const { User } = require("../models/users");
const userRouter=express.Router();

const userDetails="fullName hobbies about profilePhoto age gender"

userRouter.get("/user/request/received",userAuth,async(req,res)=>{
    try{
        const loggedInUserId=req.user._id;
const connectionRequests=await ConnectionRequestModel.find({toUserId:loggedInUserId,status:"interested"}).populate("fromUserId",userDetails)

if(!connectionRequests){
    return res.status(400).json({message:"No Connection Request",data:[]})
}
res.json({message:"Data Fetched sucessfully",data:connectionRequests})
    }catch(err){

        return res.json({message:err.message,data:[]})
    }

})
userRouter.get("/user/connections",userAuth,async(req,res)=>{
   
    try{
         const loggedUserId=req.user._id;
            
const connections=await ConnectionRequestModel.find({$or:[{toUserId:loggedUserId,status:"accepted"},{fromUserId:loggedUserId,status:"accepted"}]}).populate("fromUserId",userDetails).populate("toUserId",userDetails)
    
if(!connections){
        return res.json({message:"No Friends Add a friend and check",data:[]})
    }
    const data=connections.map((connection)=>{
    if(connection.fromUserId.equals(loggedUserId)){
        return connection.toUserId
    }
    else{
        return connection.fromUserId
    }
})
res.json({message:"Sucessful",data:data})
    }catch(err){
        res.json({message:err.message})

    }
})
userRouter.get("/user/feed",userAuth,async(req,res)=>{
    try{const loggedUser=req.user._id;
const page=parseInt(req.query.page)||1;
let limit=parseInt(req.query.limit)||10;
limit=limit>50?50:limit
const skip=(page-1)*limit;
const connections=await ConnectionRequestModel.find({$or:[{fromUserId:loggedUser},{toUserId:loggedUser}]}).select("fromUserId toUserId")
const blockedUsers=new Set();
connections.forEach((connection)=>{
    blockedUsers.add(connection.fromUserId.toString())
    blockedUsers.add(connection.toUserId.toString())
})
const users=await User.find({$and:[{_id:{$nin:Array.from(blockedUsers)}},{_id:{$ne:loggedUser}}]}).select(userDetails).skip(skip).limit(limit)

res.json(users)}catch(err){
    return res.json({message:err.message})
}
//First I want to make sure that what are the detailsthat i can show in the feed
//User cannot see their own profile on the feed,user cannot see their friends,interested,ignored profiles on the feed
//To implement this we are going to use datastructures called set okay
//Code logic
//Step 1:first of all fetch all the users id that the logged user sent or receive request.
//step 2:Secondly we have to create a empty set where we store all the values and avoides the duplicates
//Then after that again we query by using the conditin on the users model the user id cannot be the person who is in the set

})
module.exports=userRouter