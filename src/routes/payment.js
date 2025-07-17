const express=require('express')
const paymentRouter=express.Router();
const razorPayInstance=require('../utils/razorpay');
const {userAuth}=require("../middlewares/auth");
const Payment=require("../models/payment");
const PRICE=require("../utils/constants");
const {User}=require('../models/users');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')

paymentRouter.post("/payment/create",userAuth,async(req,res)=>{
    try{
        const {memberShipType}=req.body;
        const {fullName,emailId,}=req.user;

       const order=await  razorPayInstance.orders.create({
            amount:PRICE[memberShipType]*100,
            currency:"INR",
            receipt:"receipt#1",
            notes:{
                fullName:fullName,
                emailId:emailId,
                memberShipType:memberShipType
            },
        })

        const payment=new Payment({
            userId:req.user._id,
            orderId:order.id,
            amount:order.amount,
            status:order.status,
            currency:order.currency, 
            receipt:order.receipt,
            notes:order.notes
        })
        const savedPayment=await payment.save();
        return res.status(201).json({...savedPayment.toJSON(),key:process.env.KEY_ID})

    }catch(err){
return res.status(401).json({error:err.message})
    }

})
paymentRouter.post("/payment/webhook",async(req,res)=>{
    try{
        const webhookSignature=req.get("x-razorpay-signature");
    const webhookSecret=process.env.RAZORPAYWEBHOOK_SECRET;
    const webhookBody=req.body;


    const isWebHookValid=validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret)
    if(!isWebHookValid){
        return res.status(400).json({error:"Invalid WebHook Signature"})
    }
    const paymentDetails=webhookBody.payload.payment.entity;
    const payment=await Payment.findOne({
        orderId:paymentDetails.order_id
    });
    payment.status=paymentDetails.status;;
    await payment.save();
    const user=await User.findOne({_id:payment.userId});
    user.isPremium=true;
    user.memberShipType=paymentDetails.notes.memberShipType;
    await user.save();
    }
    catch(err){
        return res.status(401).json({err:err.message})

    }
     
})
paymentRouter.get("/premium/verify",userAuth,async(req,res)=>{
   try{
     const user=req.user;
    if(user.isPremium){
        return res.status(200).json({isPremium:true})

    }
    return res.status(200).json({isPremium:false})
   }catch(err){
    return res.status(401).json({error:err.message})

   }
})

module.exports=paymentRouter