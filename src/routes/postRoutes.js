const express = require("express");
const router = express.Router();
const { createPost } = require("../controllers/postController");

// post routes
router.post("/create", createPost);
 module.exports= router;