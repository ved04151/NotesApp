import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: {
            type : String, // data type string
            required : true, // title mandatory hai
            trim : true, // extra spaces remove karega
        }, 

        // Note ka description
        content : {
            type : String,
            required : true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isDeleted : {
            type : Boolean,
            default : false,
        },
         
        deletedAt : {
            type : Date,
            default : null
        }
    },
    {
        // Ye automatically createdAt aur updatedAt add karega
        timestamps : true
    }
)

// 🔥 Compound Unique Index
noteSchema.index({ title: 1, user: 1 }, { unique: true });

// Model create kar rahe hain (collection ka naam: notes)
const Note = mongoose.model("Note", noteSchema);

export default  Note;