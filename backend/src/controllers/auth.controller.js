const checkAuth = async(req,res,next)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({message:"Unauthorized"});
    } 
}


module.exports=checkAuth;