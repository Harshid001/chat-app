const express = require('express');
const app = express();


//middleware 
app.use(express.json());






//start listening
app.listen(3000,()=>{
    console.log("backend Server Running At Port 3000");
});
