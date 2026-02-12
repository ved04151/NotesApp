// mongoose library ko import kar rahe hain
import mongoose from "mongoose";

// Database connection function bana rahe hain
 const connectDB = async () => {
    try{
        // MongoDB se connect kar rahe hain using connection string
        await mongoose.connect(process.env.MONGO_URL);
        
        // Agar connection successful ho gaya
        console.log("Database connection successfully");
    } catch(error){
        // Agar error aaya toh error print karo
        console.log("Database connection failed");
        console.log(error);

        // Server ko band kar do agar DB connect nahi hua
        process.exit(1);
    }
}
export default connectDB;