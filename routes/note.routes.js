import express from "express";
import { createNote, getAllNotes, getNote, updateNote, deleteNote, getNotes } from "../controllers/note.controller.js";
import { softDeleteNote, getTrashNotes, restoreNote, permanentlyDeleteNote} from "../controllers/note.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

// Router instance bana rahe hain
const router = express.Router();

// Create Note
router.post("/", protect, createNote);

// Get ALL NOTES
router.get("/",protect, getAllNotes);

//Get Notes page by page
router.get("/pages/", protect, getNotes);



// get Notes from trash
router.get("/trash", protect, getTrashNotes);



//Get single Note by id
router.get("/:id",protect, getNote);

// Update Note
router.put("/:id",protect, updateNote);

// Delete Note
router.delete("/:id",protect, deleteNote);



// soft Delelte Note
router.patch("/:id/delete", protect, softDeleteNote);

// restore note from trash
router.patch("/:id/restore", protect, restoreNote);

// permanently Delete note
router.delete("/:id/permanent", protect, permanentlyDeleteNote);


export default router;