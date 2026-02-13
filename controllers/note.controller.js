import Note from "../models/note.model.js";

export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // // 🔥 Manual duplicate check
        // const existingNote = await Note.findOne({
        //     title,
        //     user: req.user._id
        // });

        // if (existingNote) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "You already have a note with this title"
        //     });
        // }

        const note = await Note.create({
            title,
            content,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate title for this user"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


export const getAllNotes = async (req, res) => {
    try{
        //Database se saare Notes fetch kar rahe hai
        const notes = await Note.find({ user: req.user._id });

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
        const note = await Note.findOne({_id : id, user : req.user.id});

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
    try {
        const id = req.params.id;
        const { title, content } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // // 🔥 Check duplicate except current note
        // const duplicate = await Note.findOne({
        //     title,
        //     user: req.user._id,
        //     _id: { $ne: id }
        // });

        // if (duplicate) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "You already have a note with this title"
        //     });
        // }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { title, content },
            { returnDocument: 'after', runValidators: true }
        );

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

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate title for this user"
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

        const deletedNote = await Note.findByIdAndDelete({
            _id: id,
            user: req.user._id
        });

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
