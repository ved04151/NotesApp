import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) =>{

    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password : hashedPassword
        });

        res.status(201).json({
            success : true,
            message : "User registered successfully"
        })

    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error"
        })
    }
}

export const login = async (req, res) =>{
    
    try{
        
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({
                success : false,
                message : "Invalid credentials"
            })
        }

        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        );

        res.status(200).json({
            success: true,
            token
        });


    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error"
        })
    }
}