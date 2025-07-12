const validator=require("validator")
const validateSignUp=(req)=>{
    const{fullName,email,password}=req.body
    if(!fullName.trim()){
        throw new Error("Invalid Name")

    }
    else if(!validator.isEmail(email)){
        throw new Error("Invalid Mail")

    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password is Not Strong")
    }
};
const validateLogin=(email)=>{
    if(!validator.isEmail(email)){
        throw new Error("Invalid Email Format")
    }
}
const validateEdit=(req)=>{
    if("fullName" in req.body && typeof req.body.fullName === "string" && !req.body.fullName.trim()){
    throw new Error("Name cannot be empty")
}
 if("hobbies"in req.body && Array.isArray(req.body.hobbies) && req.body.hobbies.length>10){
    throw new Error("Hobbies must be less than 10")
}
 if("about" in req.body && typeof req.body.about === "string" && req.body.about.length>120){
    throw new Error("Character limit exceeded in the about")
}
 if("gender" in req.body && typeof req.body.gender==="string" && !["male","female","others"].includes(req.body.gender)){
    throw new Error("Invalid Gender")
}
}
module.exports={validateSignUp,validateLogin,validateEdit}