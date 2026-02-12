import express from "express";
import { createNote, getAllNotes, getNote, updateNote, deleteNote } from "../controllers/note.controller.js";

// Router instance bana rahe hain
const router = express.Router();

// Create Note
router.post("/", createNote);

//Get ALL NOTES
router.get("/", getAllNotes);

//Get single Note by id
router.get("/:id", getNote);

// Update Note
router.put("/:id", updateNote);

// Delete Note
router.delete("/:id", deleteNote);

export default router;