const mongoose = require('mongoose');


const connectDB = async()=>{
    try{
        const mongoUri = process.env.MONGO_URI;
        if(!mongoUri){
            throw new Error("Mongo URI");
        }
        const conn = await mongoose.connect(mongoUri);
        console.log("MongoDB Connected",conn.connection.host);
    }catch(e){
        console.error(e);
        process.exit(1);
    }
}


module.exports = connectDB;