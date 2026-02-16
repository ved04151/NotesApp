import express from "express";
import { createNote, getAllNotes, getNote, updateNote, deleteNote, getNotes } from "../controllers/note.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

// Router instance bana rahe hain
const router = express.Router();

// Create Note
router.post("/", protect, createNote);

// Get ALL NOTES
router.get("/",protect, getAllNotes);

//Get Notes page by page
router.get("/pages/", protect, getNotes);

//Get single Note by id
router.get("/:id",protect, getNote);

// Update Note
router.put("/:id",protect, updateNote);

// Delete Note
router.delete("/:id",protect, deleteNote);

export default router;