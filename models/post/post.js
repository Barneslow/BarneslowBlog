const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Post category is required"],
    },

    isLiked: {
      type: Boolean,
      default: false,
    },

    isDisliked: {
      type: Boolean,
      default: false,
    },

    numViews: {
      type: Number,
      default: 0,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Author is required"],
    },

    description: {
      type: String,
      //   required: [true, "Post description is required"],
    },

    image: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2022/06/22/10/47/cheetah-7277665_960_720.jpg",
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
