//dotenv config
require('dotenv').config();

//express
const express = require('express');
const app = express();

//imports
const connectDB = require('./lib/db');
const clerkMiddleware = require('@clerk/express');
const cors = require('cors');

//env imports
const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL

//middleware 
app.use(express.json());
app.use(cors({origin:FRONTEND_URL,credentials:true}));
app.use(clerkMiddleware());

//routes
app.get('/health',(req,res)=>{
    res.status(200).json({ok:true});
});


//start listening
app.listen(PORT,()=>{
    connectDB();
    console.log(`backend Server Running At Port ${PORT}`);
});
