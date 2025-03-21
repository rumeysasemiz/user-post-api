const Post = require("../models/postModel");

const createPost = async (title, content, tags, userId) => { 
    try {
        const newPost = new Post({ title, content, tags, userId });
        await newPost.save();
        return {
            message: "Post created",
            postId: newPost._id,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};
module.exports = {
    createPost,
};