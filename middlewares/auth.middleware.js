import User from "../models/user.model.js";


export const protect = async (req, res, next) => {
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success : false,
                message : "Not authorized, no token"
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decode.id).select("-password");

        if(!user){
            return res.status(401).json({
                success : false,
                message : "User not found"
            })
        }

        req.user = user;
        next();

    }catch(error){
        res.status(401).json({
            success: false,
            message: "Token invalid"
        });
    }
}