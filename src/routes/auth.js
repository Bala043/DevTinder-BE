const express=require("express");
const authRouter=express.Router();
const {User}=require("../models/users")
const {validateSignUp,validateLogin}=require("../utils/validation")
const bcrypt=require("bcrypt")
authRouter.post("/signup",async(req,res)=>{
    try{
        validateSignUp(req)
        const {password,fullName,email}=req.body
        const passwordHash=await bcrypt.hash(password,10)
    const user=new User({fullName,email,password:passwordHash})
     await user.save()
     res.status(200).json({message:"Sucessfully Posted The Data"})
    }
    catch(err)
    {
    res.status(400).json(err.message)
}})
authRouter.post("/login",async(req,res)=>{
    try{
        const{email,password}=req.body;
        validateLogin(email)
        const match=await User.findOne({email:email})
        if(!match){
            res.status(400).send("Invalid Credentials")
        }
        const isPasswordMatch=await match.validateLoginPassword(password)
        if(isPasswordMatch){
            //generate the token using jwt
            const token=await match.getJWT();
            res.cookie("token",token,{expires:new Date(Date.now()+7*24*60*60*1000)})
            const{fullName,email,about,hobbies,profilePhoto,age,gender}=match
            return res.json({fullName,email,about,hobbies,profilePhoto,age,gender})
        }
        else{
            res.status(400).json("Invalid Credentials")
        }
    }
    catch(err){
        res.send(err.message)
    }
})
authRouter.post("/logout",async(req,res)=>{
    res.cookie("token",null,{expires:new Date(Date.now())})
    return res.send("Logout Sucessful")
})

module.exports=authRouter