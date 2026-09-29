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
const clerkWebhook = require('./webhooks/clerk.webhook');
const job = require('./lib/cron');
const authRoutes = require('./routes/auth.route');
//env imports
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const NODE_ENV = process.env.NODE_ENV;
const publicDir = path.join(process.cwd(),"public");

app.use('/api/webhooks/clerk',express.raw({type:"application/json"}),clerkWebhook);
//middleware 
app.use(express.json());
app.use(cors({origin:FRONTEND_URL,credentials:true}));
app.use(clerkMiddleware());

//routes
app.get('/health',(req,res)=>{
    res.status(200).json({ok:true});
});
app.use('/api/auth',authRoutes);
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
