const postService = require('../services/postServices');

// new post created
const createPost = async (req, res) => {
    const userId = req.user.id;
    try {
        const newPost = await postService.createPost(req.body.title, req.body.content, req.body.tags, userId);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
    
};
// get all posts 
const getAllPosts = async (req, res) => { 
    try {
        const posts = await postService.getAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ message: error.message });   
        
    }
};
const getPostsByUserId = async (req, res) => {

    try {
        const userId = req.params.id;
        const posts=await postService.getPostsByUserId(userId);
        res.status(200).json(posts);
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ message: error.message });
        
    }
    
};
const getPostsByTag = async (req, res) => { 
    try {
        const tag = req.params.tag;
        const posts = await postService.getPostsByTag(tag);
        res.status(200).json(posts);
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ message: error.message });
        
    }
};
const getPostById = async (req, res) => { 
    try {
        const postId = req.params.id;
        const post = await postService.getPostById(postId);
        res.status(200).json(post);
    } catch (error) {
        console.log("error:", error);   
        if(error.message==="Post not found"){
            res.status(404).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error.message });

        }
        
    }
};
const updatedPost = async (req, res) => { 
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const updateData = req.body;
        const updatedPost = await postService.updatePost(postId, userId, updateData);
        res.status(200).json({
            message: "Post updated",
            post: updatedPost,
        });
    } catch (error) {
        console.log("error:", error);
        if (error.message === "Post not found") {
            res.status(404).json({ message: error.message });
        } else if (error.message === "You are not authorized to update this post") {
            res.status(401).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const deletedPost = await postService.deletePost(postId, userId);
        res.status(200).json({ message: "Post deleted" });
        
    } catch (error) {
        console.log("error:", error);   
        if (error.message === "post not found") {
            res.status(404).json({ message: error.message });
        } else if (error.message === "You are not authorized to delete this post") {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });

         }

        
        
        
    }
 };
module.exports = {
    createPost,
    getAllPosts,
    getPostsByUserId,
    getPostsByTag,
    getPostById,    

    updatedPost,
    deletePost
};