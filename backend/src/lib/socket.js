const express = require('express');
const http = require('http');
const {Server} = require('socket.io');



const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.FRONTEND_URL;
const io = new Server(server,{cors:{origin:[allowedOrigin]} } );


function getReceiverSocketId(userId){
    return userSocketMap[userId];
}


const userSocketMap = {};



io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;

    if(userId) userSocketMap[userId] = socket.io;
    //shows onlineusers
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        if(userId) delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    });
});


module.exports = {app,server,io, getReceiverSocketId};