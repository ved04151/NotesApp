import Note from "../models/note.model.js";

export const createNote = async (req, res) =>{

    try{
        // Request body se data le rahe hai
        const {title, content} = req.body;

        const note = await Note.create({
            title : title,
            content : content
        })

        // Successresponse bhej rahe hai
        res.status(201).json({
            success : true,
            message : "Note Created Successfully",
            data : note
        })

    } catch(error){
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Title already exists"
            });
        }

        res.status(500).json({
            success : false,
            message : "Server error",
            error : error
        })
    }
};

export const getAllNotes = async (req, res) => {
    try{
        //Database se saare Notes fetch kar rahe hai
        const notes = await Note.find();

        res.status(200).json({
            success : true,
            count : notes.length,
            data : notes
        })

    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error",
            error : error,
        })
    }
};

export const getNote = async (req, res) => {
    try {
        //Url se id le rahe hai
        const id = req.params.id;
        const note = await Note.findById(id);

        //Agar
        if(!note){
            return res.status(404).json({
                success : false,
                message : "Note not found"
            })
        }

        res.status(200).json({
            success : true,
            message : "note get Successfully",
            data : note
        })
        
    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error"
        });
    }
}

export const updateNote = async (req, res) => {
    try{
        const id = req.params.id;
        
        const {title, content}  = req.body;

        // Validation - empty ya missing fields check
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // findByIdAndUpdate se note update kar rahe hain
        const updatedNote = await Note.findByIdAndUpdate(
            id,             // konsa note update karna hai
            {                        // kya update karna hai (object ke andar)
                title,
                content
            },
            {returnDocument: "after", runValidators: true }    // updateed version return karega
        )

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: updatedNote
        });
    }catch(error){
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Title already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
