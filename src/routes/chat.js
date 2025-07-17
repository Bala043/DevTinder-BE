const express=require("express");
const { userAuth } = require("../middlewares/auth");
const { User } = require("../models/users");
const chatRouter=express.Router()
const {Chat}=require("../models/chat")

chatRouter.get("/chat/:id",userAuth,async(req,res)=>{
    const {id}=req.params;
    const user=await User.findOne({_id:id})
    if(!user){
        return res.status(404).send({message:"No user Found"})
    }
    return res.status(200).json({name:user.fullName,photo:user.profilePhoto})
})
chatRouter.get("/chat/getchat/:id",userAuth,async(req,res)=>{
    const{id}=req.params;
    const userId=req.user._id
    try{
        let chat=await Chat.findOne({participants:{$all:[userId,id]}})
        if(!chat){
            chat=new Chat({
                participants:[userId,id],
                messages:[]
            })
        }
        await chat.save();
        return res.status(200).json(chat)
    }
    catch(err){

    }


})
module.exports=chatRouter;
