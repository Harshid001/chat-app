//dotenv config
require('dotenv').config();

//express
const express = require('express');
const app = express();

//imports
const connectDB = require('./lib/db');
const { clerkMiddleware } = require('@clerk/express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const job = require('./lib/cron');
//env imports
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const NODE_ENV = process.env.NODE_ENV;
const publicDir = path.join(process.cwd(),"public");
//middleware 
app.use(express.json());
app.use(cors({origin:FRONTEND_URL,credentials:true}));
app.use(clerkMiddleware());

//routes
app.get('/health',(req,res)=>{
    res.status(200).json({ok:true});
});

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));
    app.get("/{*any}",(req,res,next)=>{
        res.sendFile(path.join(publicDir,"index.html"), (e)=> next(e));
    });
}


//start listening
app.listen(PORT,()=>{
    connectDB();
    console.log(`backend Server Running At Port ${PORT}`);
    
    if(NODE_ENV ==='production'){
        job.start();
    }
});
