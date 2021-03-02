const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    sid: {
      type: Number,
      required: true,
    },
    date: Date,
    title: String,
    content: String,
    category: {
      type: String,
      index: true,
    },
    attachments: [String],
    source: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
