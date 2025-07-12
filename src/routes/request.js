const express=require("express")
const requestRouter=express.Router()
const {userAuth}=require("../middlewares/auth");
const ConnectionRequestModel=require("../models/connectionRequest");
const { User } = require("../models/users");
requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
   try{
    const fromUserId=req.user._id;
    const toUserId=req.params.toUserId;
    const status=req.params.status;
    const allowedStatus=["interested","ignored"];
    if(!allowedStatus.includes(status)){
       return res.status(400).json({
            message:"Bad Request Invalid Status",
            data:{
            }
        })
    }
    const statusMessages = {
  interested: "has shown interest in you",
  ignored: "has chosen to ignore your profile",
};
    //Check If the toUser exist in the database if we not check this condition means this will accept any unwanted object id
    const isValidToUser=await User.findById(toUserId)
    if(!isValidToUser){
        return res.status(400).json({
            message:"You Are Sending The Request To The Account That Does Not Exist In Our Platform",
            data:{

            }
        })
    }
    //check If the connection is already exist or not
    const existingConnectionRequest=await ConnectionRequestModel.findOne({
        $or:[
            {fromUserId,toUserId},{fromUserId:toUserId,toUserId:fromUserId}
        ]  
    })
    if(existingConnectionRequest){
        return res.status(400).json({
            message:"The connection request already exist check the requests list"
        })
    }
   const connectionRequest=new ConnectionRequestModel({
    fromUserId,toUserId,status
   })
   await connectionRequest.save()
   res.status(200).json({
    message:req.user.fullName+" "+statusMessages[status]
   })
   }
   catch(err){
    res.status(400).json({
        message:err.message,
        data:{

        }
    })

   }
})
requestRouter.post("/request/review/:status/:fromUserId",userAuth,async(req,res)=>{
    try{
        const allowedUpdates=["accepted","rejected"];
    const loggedInUser=req.user._id;
    console.log(req.params);
    const {status,fromUserId}=req.params;
    
    if(!allowedUpdates.includes(status)){
        return res.status(400).json({message:"Invalid request",data:{}})
    }
    const connectionRequest=await ConnectionRequestModel.findOne({fromUserId,toUserId:loggedInUser,status:"interested"})
    if(!connectionRequest){
        return res.status(400).json({message:"Duplicate Request"})
    }
     const statusResponse={
        accepted:"Congratulations You Are friends you can send hi message",
        rejected:"Sucessfully rejected"
    }
    connectionRequest.status=status;
    const data =await connectionRequest.save();
    return res.status(200).json({message:statusResponse[status],data})
    }catch(err){
        return res.status(400).json({message:err.message})
    }
    
})
module.exports=requestRouter