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

        // Get page number from query, default = 1
        const page = parseInt(req.query.page) || 1;

        // Get limit from query, default = 10, max allowed = 100
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);

        // Get search term from query
        const search = req.query.search || "";

        const allowedSortFields = ["createdAt", "updatedAt", "title"]; //Validation on sortField so user can sort only given fields

        const sortField = allowedSortFields.includes(req.query.sort) ? req.query.sort : "createdAt";

        // const sortField = req.query.sort || "createdAt";  // default sort
        const order = req.query.order === "asc" ? 1 : -1; // default desc
        
        // Validate page and limit
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive numbers"
            });
        }

        // Calculate how many documents to skip
        const skip = (page - 1) * limit;

        // Base filter: only logged-in user's notes
        const filter = {
            user: req.user.id,
            isDeleted: false
        };

        // If search exists, add title/description matching
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        // { // Thats how its JSON LOOKS 
        //     user: "user1",
        //     $or: [ // $or is a MongoDB operator like -> Inme se koi bhi condition true ho to document match hai.
        //         { title: { $regex: "gym", $options: "i" } }, $regex ==> Regular Expression ==> partial matching
        //         { description: { $regex: "gym", $options: "i" } } "i" ==> case sensitive
        //     ]
        // }

        // Count total filtered notes (important for pagination) 
        const totalNotes = await Note.countDocuments(filter); // => to calculate total number of pages using math.ceil notes/limit

        // Fetch paginated and sorted notes
        const notes = await Note.find(filter) // it will find all notes according to filter
            .sort({ [sortField]: order }) // dynamic sort ==> sortField mean according to which field : order like 1 aec or -1 dec
            .skip(skip)              // skip previous pages
            .limit(limit);           // limit results per page

        // Send structured response
        res.status(200).json({
            success: true,
            totalNotes,
            currentPage: page,
            totalPages: Math.ceil(totalNotes / limit),
            hasNextPage: page < Math.ceil(totalNotes / limit),
            hasPrevPage: page > 1,
            sortBy: sortField,
            order: order === 1 ? "asc" : "desc",
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

export const softDeleteNote = async (req, res) =>{
    try {
        const note = await Note.findOneAndUpdate(
            {_id: req.params.id, user : req.user._id},
            {
                isDeleted : true,
                deletedAt : new Date()
            },
            {returnDocument : "after"}
        )

        if(!note) {
            return res.status(404).json({
                success : false,
                message : "Note not found"
            })
        }

        res.status(200).json({
            success : true,
            message : "Note moved to trash"
        })
    }catch (error){
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getTrashNotes = async (req, res) => {
  try {

    // -----------------------------
    // 1️⃣ Pagination Setup
    // -----------------------------

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 5, 100); 
    // limit max 100 tak allow (safety)

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values"
      });
    }

    const skip = (page - 1) * limit;


    // -----------------------------
    // 2️⃣ Search Setup
    // -----------------------------

    const search = req.query.search || "";


    // -----------------------------
    // 3️⃣ Sorting Setup
    // -----------------------------

    // Whitelist allowed sort fields (security purpose)
    const allowedSortFields = ["createdAt", "updatedAt", "title", "deletedAt"];

    const sortField = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : "deletedAt"; // default sort by deletedAt (latest deleted first)

    const order = req.query.order === "asc" ? 1 : -1;


    // -----------------------------
    // 4️⃣ Base Filter (Only Trash)
    // -----------------------------

    const filter = {
      user: req.user.id,
      isDeleted: true
    };


    // -----------------------------
    // 5️⃣ Add Search Condition (If Exists)
    // -----------------------------

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }


    // -----------------------------
    // 6️⃣ Count Total Trash Notes
    // -----------------------------

    const total = await Note.countDocuments(filter);


    // -----------------------------
    // 7️⃣ Fetch Trash Notes
    // -----------------------------

    const notes = await Note.find(filter)
      .sort({ [sortField]: order })
      .skip(skip)
      .limit(limit);


    // -----------------------------
    // 8️⃣ Send Response
    // -----------------------------

    res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      sortBy: sortField,
      order: order === 1 ? "asc" : "desc",
      notes
    });

  } catch (error) {

    console.error("Trash Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const restoreNote = async (req, res) => {
    try{
        const note = await Note.findOneAndUpdate(
            {_id: req.params.id, user : req.user.id},
            {
                isDeleted : false,
                deletedAt : null
            },
            {returnDocument : "after"}
        )

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note restored successfully"
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const permanentlyDeleteNote = async (req, res) => {
    try{
        const note = await Note.findOneAndDelete({
            _id : req.params.id,
            user : req.user.id,
            isDeleted : true
        })

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note Deleted successfully"
        });

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
