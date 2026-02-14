import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER CONTROLLER =================
export const register = async (req, res) =>{

    try{
        const {name, email, password} = req.body;

        // Validation — agar koi field missing hai
        if(!name || !email || !password){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }

        // Check kar rahe hain user already exist karta hai ya nahi
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User already exists"
            })
        }

        // Password ko hash kar rahe hain (security ke liye)
        // 10 = salt rounds (hashing complexity)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Database me new user create kar rahe hain
        const user = await User.create({
            name,
            email,
            password : hashedPassword
        });

        // JWT token generate kar rahe hain user id ke saath
        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        // Token ko cookie me store kar rahe hain
        res.cookie("token", token, {
            httpOnly: true, // JS se access nahi ho sakta (security)
            secure: process.env.NODE_ENV === "production",  // production me https only
            sameSite: "strict", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 din
        });

        // Response send kar rahe hain (password nahi bhej rahe)
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error"
        })
    }
}

// ================= LOGIN CONTROLLER =================
export const login = async (req, res) =>{
    
    try{
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }
        
        // Database me user find kar rahe hain
        const user = await User.findOne({ email });

        // Agar user exist nahi karta
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Password compare kar rahe hain (plain vs hashed)
        const isMatch = await bcrypt.compare(password, user.password);

        // Agar password match nahi hua
        if(!isMatch){
            return res.status(400).json({
                success : false,
                message : "Invalid credentials"
            })
        }

        // Login success → JWT token generate
        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        // Cookie me token store
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Response send
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });


    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error"
        })
    }
}

// ================= LOGOUT CONTROLLER =================
export const logout = async (req, res) =>{
    try{

        // Cookie ko expire kar rahe hain → logout
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0)    // past date = cookie delete
        });

         res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error"
        })
    }
}