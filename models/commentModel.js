const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  docId: {
    type: String,
    required: true,
    trim: true,
  },
  commenterId: {
    type: String,
    required: true,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    trim: true,
  },
});

const CommentModel = mongoose.model("CommentModel", commentSchema);
module.exports = CommentModel;
