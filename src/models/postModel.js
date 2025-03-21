const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],

    },
    content: {
        type: String,
        required: [true, "Content is required"],
    },
    tags: {
        type: [String],
        required: [true, "Tags are required"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("Post", postSchema);