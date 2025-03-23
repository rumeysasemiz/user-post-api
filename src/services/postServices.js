const Post = require("../models/postModel");
const User = require("../models/userModel");  // Bu satırı ekleyin
const createPost = async (title, content, tags, userId) => {
    try {
        // Kullanıcının var olup olmadığını kontrol et
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
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
const getAllPosts = async () => {
    try {
        const posts = await Post.find({}).populate("userId", "username email").sort({ createdAt: -1 });
        return posts;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);

    }
};
const getPostsByUserId = async (userId) => {
    try {
        // öncce kullanıcı var mı onu kontrol ediyoruz 
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const posts = await Post.find({ userId }).populate("userId", "username email").sort({ createdAt: -1 });
        return posts;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message
        );

    }
};
const getPostsByTag = async (tag) => {
    try {
        const posts = await Post.find({ tags: tag }).populate("userId", "username email").sort({ createdAt: -1 });
        return posts;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);

    }
};
const getPostById = async (postId) => {
    try {
        const post = await Post.findById(postId).populate("userId", "username email");
        if (!post) {
            throw new Error("Post not found");

        }
        return post;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);

    }
};
const updatePost = async (postId, userId, updateData) => {
    try {
        // Önce kullanıcının var olup olmadığını kontrol et
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        if (post.userId.toString() !== userId) throw new Error("You are not authorized to update this post");

        const updatedPost = await Post.findByIdAndUpdate(postId, { $set: updateData }, { new: true, runValidators: true }).populate("userId", "username email");
        return updatedPost;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);

    }
};
const deletePost = async (postId, userId) => {
    try {
           // Önce kullanıcının var olup olmadığını kontrol et
           const user = await User.findById(userId);
           if (!user) {
               throw new Error("User not found");
           }
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        if (post.userId.toString() !== userId) {
            throw new Error("You are not authorized to delete this post");
        }
        await Post.findByIdAndDelete(postId);
        return { message: "Post deleted successfully", postId: postId };
    } catch (error) {

        console.log("error:", error);
        throw new Error(error.message);
    }

};
module.exports = {
    createPost,
    getAllPosts,
    getPostsByUserId,
    getPostsByTag,
    getPostById,
    updatePost,
    deletePost
};