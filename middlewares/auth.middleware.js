import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


export const protect = async (req, res, next) => {
    try{

        const token = req.cookies.token;
    
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Not authorized, no token"
            })
        }

        // JWT token ko verify kar rahe hain secret key se
        // Agar token invalid hoga to error throw hoga (catch block me chala jayega)
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        
        
        // Token se jo user id mili usse database me user search kar rahe hain
        // .select("-password") ka matlab password field response me include nahi hogi
        const user = await User.findById(decode.id).select("-password");
        
        // Agar user database me nahi mila → unauthorized
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User not found"
            })
        }
        
        // User data request object me attach kar rahe hain
        // Taaki next middleware ya controller me req.user se access ho sake
        req.user = user;

        // Next middleware/controller ko call kar rahe hain
        next();

    }catch(error){
        res.status(401).json({
            success: false,
            message: "Token invalid"
        });
    }
}