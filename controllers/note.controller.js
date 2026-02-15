import Note from "../models/note.model.js";

export const createNote = async (req, res) => {
    try {
        // Request body se title aur content nikal rahe hain
        const { title, content } = req.body;

        // Validation:
        // ?.trim() ka matlab → agar value exist karti hai to trim karo
        // Empty string ya spaces allowed nahi honge
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // ================= OPTIONAL MANUAL DUPLICATE CHECK =================
        // Ye code check karta ki same user ke paas same title wali note already hai ya nahi
        // Abhi comment hai kyunki aap database unique index se duplicate handle kar rahe ho

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

        // Database me new note create kar rahe hain
        // req.user._id middleware (protect) se aa raha hai
        const note = await Note.create({
            title,
            content,
            user: req.user._id  // note kis user ki hai
        });

        // Success response
        res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note
        });

    } catch (error) {

        // MongoDB duplicate key error code = 11000
        // Agar unique constraint violate hua (same title same user)
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
        // Database se sirf current logged-in user ki notes fetch kar rahe hain
        // req.user._id middleware (protect) se aata hai
        const notes = await Note.find({ user: req.user._id });

        res.status(200).json({
            success : true,
            count : notes.length, // total notes count
            data : notes          // notes data
        })

    }catch(error){
        res.status(500).json({
            success : false,
            message : "server error",
            error : error,
        })
    }
};

export const getNotes = async (req, res) => {
    try{

        // 1️⃣ Query params
        const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 5;

        const limit = Math.min(parseInt(req.query.limit) || 5, 100); // data limit will be with in 5 to 100


        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive numbers"
            });
        }

        // 2️⃣ Calculate skip
        const skip = (page - 1) * limit;

        // 3️⃣ Total documents count (for metadata)
        const totalNotes = await Note.countDocuments({
            user: req.user.id
        });

        // 4️⃣ Fetch paginated notes
        const notes = await Note.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 5️⃣ Send structured response
        res.status(200).json({
            success: true,
            totalNotes,
            currentPage: page,
            totalPages: Math.ceil(totalNotes / limit),
            notes
        });


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
        // URL params se note id le rahe hain
        const id = req.params.id;

        // Database me note find kar rahe hain
        // Condition: note id match + same user ka hona chahiye
        const note = await Note.findOne({_id : id, user : req.user._id});

        // Agar note exist nahi karta
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
        // URL params se id
        const id = req.params.id;
        // Request body se updated data
        const { title, content } = req.body;

        // Validation (empty ya spaces allowed nahi)
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // ================= OPTIONAL DUPLICATE CHECK =================
        // Current note ko ignore karke duplicate title check kar sakte hain

        // const duplicate = await Note.findOne({
        //     title,
        //     user: req.user._id,
        //     _id: { $ne: id } // $ne = not equal
        // });

        // if (duplicate) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "You already have a note with this title"
        //     });
        // }

        // Database me note update kar rahe hain
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, user: req.user._id }, // condition
            { title, content },              // update data
            {
                returnDocument: 'after',     // updated document return karo
                runValidators: true          // schema validation apply karo
            }
        );

        // Agar note nahi mila
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
        // Duplicate key error (unique index violation)
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

        // Note delete kar rahe hain
        // Condition: id match + same user ka hona chahiye
        const deletedNote = await Note.findOneAndDelete({ _id: id, user: req.user._id });

        // Agar note exist nahi karta
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
