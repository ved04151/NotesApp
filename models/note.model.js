import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: {
            type : String, // data type string
            required : true, // title mandatory hai
            trim : true, // extra spaces remove karega
            unique : true
        }, 

        // Note ka description
        content : {
            type : String,
            required : true
        },   
    },
    {
        // Ye automatically createdAt aur updatedAt add karega
        timestamps : true
    }
)

// Model create kar rahe hain (collection ka naam: notes)
const Note = mongoose.model("Note", noteSchema);

export default  Note;