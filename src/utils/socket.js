 const socket=require("socket.io")
 const {Chat}=require("../models/chat")
const initializeSocket=(server)=>{
   
const io=socket(server,{
    cors:{
        origin:[process.env.FRONTEND_URL,"http://34.201.77.122"]
    }
});
io.on("connection",(socket)=>{
    //Handle Events
   socket.on("joinChat",({fullName,userId,id})=>{
    const roomId=[userId,id].sort().join("_");
    console.log(fullName +"Joined to the room Id"+roomId)
    socket.join(roomId)//join is a default function in the we have to join the room
   })

   socket.on("sendMessage",async({fullName,userId,id,text})=>{
   try{ 
        const roomId=[userId,id].sort().join("_");
            let chat=await Chat.findOne({participants:{$all:[userId,id]}});
            if(!chat){
            chat=new Chat({
                participants:[userId,id],
                messages:[]
            })
    }
    console.log(chat)
    
    chat.messages.push({senderId:userId,text})
    console.log(chat)
    await chat.save();
     
    io.to(roomId).emit("messageReceived",{fullName,text,userId,id})
     socket.on("Disconnect",()=>{}) 
   }
   catch(err){

    console.log(err)
   } 
   })
   
})
}
module.exports={initializeSocket}