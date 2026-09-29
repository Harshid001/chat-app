const {CronJob} = require('cron');
const http = require('node:http');
const https = require('node:https');



//every 14 mins send a GET request to the health end point

const job = new CronJob("*/14 * * * *",function(){
    const base = process.env.FRONTEND_URL;
    if(!base){
        return;
    }
    const url = new URL("/health",base).href;
    const client = url.startsWith("https:") ? https : http;

    client.get(url,(res)=>{
        if(res.statusCode === 200) console.log("Get Request Send Successfully");
        else console.log("Get Request Failed",res.statusCode);

    }).on("error",(e)=> console.error("Error",e));
});


module.exports=job;