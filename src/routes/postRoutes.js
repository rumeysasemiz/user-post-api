const express = require("express");
const router = express.Router();
const { createPost,getAllPosts ,getPostsByUserId,getPostsByTag,getPostById,updatedPost,deletePost} = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

// post routes
router.post("/create",authMiddleware, createPost);
router.get("/", getAllPosts);
router.get("/user/:id", getPostsByUserId);
router.get("/tag/:tag", getPostsByTag);
router.get("/:id", getPostById);
router.put("/:id", authMiddleware, updatedPost);
router.delete("/:id", authMiddleware, deletePost);
 module.exports= router;