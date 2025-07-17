
const jwt=require("jsonwebtoken");
const {User}=require("../models/users")
const userAuth=async(req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token){
           return res.status(401).send("Invalid Token")
        }
        const decodedMessage=await jwt.verify(token,process.env.JWT_SECRET_KEY);
        const{_id}=decodedMessage;
        const user=await User.findById(_id)
    if(!user)
    {
       return res.status(401).send("User not found")
    }
    req.user=user;
    return next()
        }catch(err){
            return res.status(400).send(err.message)

        }
}
module.exports={userAuth}