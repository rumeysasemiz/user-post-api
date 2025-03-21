const postService = require('../services/postService');

// new post created
const createPost = async (req, res) => {
    const userId = req.user._id;
    try {
        const newPost = await postService.createPost(req.body.title, req.body.content, req.body.tags, userId);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
    
};

module.exports = {
    createPost,
};