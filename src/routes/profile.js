const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const { validateEdit } = require("../utils/validation");
const bcrypt=require("bcrypt")
const validator=require("validator")
profileRouter.get("/profile",userAuth,async(req,res)=>{
try{
    const user=req.user;
res.send(user)
}catch(err){
    res.send(err.message)
}
})
profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{
    try{
const allowedEdits=["fullName","age","gender","about","profilePhoto","hobbies"]
const isEditValid=Object.keys(req.body).every((field)=>allowedEdits.includes(field))
if(!isEditValid){
    throw new Error("Edit Access Denied")
}
const loggedUser=req.user;
validateEdit(req)
Object.keys(req.body).forEach((key)=>{
    loggedUser[key]=req.body[key]
})

await loggedUser.save()
res.send(loggedUser)
    }catch(err){
        res.status(400).json({error:err.message})
    }
})
profileRouter.patch("/profile/passwordupdate",userAuth,async(req,res)=>{
    try{
        const allowedUpdates=["oldpassword","newpassword"]
    const isValid=Object.keys(req.body).every((key)=>allowedUpdates.includes(key))
    if(!isValid){
        throw new Error("Invalid Input check and try again");
    }
    if("oldpassword" in req.body && typeof req.body.oldpassword!=="string"){
        throw new Error("invalid password format")
    }
     if("oldpassword" in req.body && req.body.oldpassword.trim()===""){
        throw new Error("Password Cannot Be empty")
    }
    const user=req.user;
    const {password}=user;
    const isPasswordValid=await bcrypt.compare(req.body.oldpassword,password)
    if(!isPasswordValid){
        throw new Error("Your old password is wrong")
    }
     if("newpassword" in req.body && typeof req.body.newpassword!=="string"){
        throw new Error("invalid password format")
    }
     if("newpassword" in req.body && req.body.newpassword.trim()===""){
        throw new Error("Password Cannot Be empty")
    }
    if(req.body.oldpassword===req.body.newpassword){
        throw new Error("Old Password And New password cannot Be same")
    }
    const isPasswordStrong=validator.isStrongPassword(req.body.newpassword);
    if(!isPasswordStrong){
        throw new Error("Password is Not Strong")
    }
    const passwordHash=await bcrypt.hash(req.body.newpassword,10)
    user.password=passwordHash
    await user.save()
    res.send("Password Changed sucessfully")
    }catch(err){
        res.send(err.message)
    }
})

module.exports=profileRouter;