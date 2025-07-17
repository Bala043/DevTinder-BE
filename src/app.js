require("dotenv").config()
const cors=require("cors")

const express=require("express");
const {connectDb}=require("../src/config/database");
const cookieParser=require("cookie-parser");
const app=express();
app.use(cors({
    origin:[process.env.FRONTEND_URL, "http://34.201.77.122"],
    credentials:true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
}))
const authRouter=require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/request");
const userRouter=require("./routes/user")
const paymentRouter=require("./routes/payment");
const chatRouter=require("./routes/chat")

const http=require("http");
const {initializeSocket}=require("./utils/socket");


app.use(express.json())
app.use(cookieParser())
app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)
app.use("/",paymentRouter)
app.use("/",chatRouter)
const server=http.createServer(app);
initializeSocket(server)

connectDb().then(()=>{
    server.listen(process.env.PORT,()=>{
        console.log("Server Connected Sucessfully")
    })
}).catch((err)=>{
console.log(err)})
