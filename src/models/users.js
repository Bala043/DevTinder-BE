const mongoose=require("mongoose")
const validator=require("validator")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const userSchema=mongoose.Schema({
    fullName:{
        type:String,
        minLength:4,
        maxLength:35,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Invalid Email Address")
            }
        }
    },
    password:{
        type:String,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error ("Password is Not Strong") 
            }
        }

    },
    phoneNo:{
        type:Number
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender is Not valid")
            }    },
            default:"others"
    },
    
    hobbies:{
        type:[String]
    },
    profilePhoto:{
        type:String,
        default:"https://st4.depositphotos.com/3864435/27060/i/450/depositphotos_270605520-stock-photo-default-avatar-profile-icon-grey.jpg",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error ("Invalid Photo URL")
            }}
    },
    about:{
        type:String,
        default:"Hey! I am using Tinder"
    },
    age:{
        type:Number,
        min:18,
        max:100,
        default:18

    }
},{timestamps:true})
userSchema.methods.getJWT=async function(){
    const match=this;
const token=await jwt.sign({_id:match._id},"SECRETKEY",{expiresIn:"7d"})
return token
}
userSchema.methods.validateLoginPassword=async function(inputpass){
    const match=this;
    const passwordHash=match.password;
    const isPasswordValid=await bcrypt.compare(inputpass,passwordHash)
    return isPasswordValid
}
const User=mongoose.model("User",userSchema)
module.exports={
    User:User
}