const {getAuth} = require('@clerk/express');
const User = require('../models/user.model');

const protectRoute = async(req,res,next)=>{
    try{
        const {userId} = getAuth(req);
        if(!userId){
            res.status(401).json({message:"Unauthorized"});
            return;
        }
        const user = await User.findOne({clerkId : userId});
        if(!user){
            res.status(404).json({message:"User Profile Not Synced Yet"});
        }
        req.user = user;
        
        next();

    }catch(e){
        console.error("Error In Middleware",e.meesage);
        res.status(500).json({message:"Internal Server Error"});
    }
}


module.exports = protectRoute;