const expressAsyncHandler = require("express-async-handler");
const fs = require("fs");
const badwords = require("bad-words");
const Post = require("../models/post/post");
const validMongoId = require("../utils/validateMongooseId");
const User = require("../models/user/user");
const cloudinaryUploadingImg = require("../utils/cloudinary");
const { isBlocked } = require("../utils/isBlocked");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

exports.createPost = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  validMongoId(_id);

  isBlocked(req.user);

  const filter = new badwords();
  const isProfane = filter.isProfane(req.body.title, req.body.description);

  if (isProfane) {
    const user = await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });

    throw new Error(
      "Creating failed because it contains profane words and you have been blocked"
    );
  }

  // Prevent Post if Starter Account

  if (req?.user?.accountType === "Starter Account" && req?.user?.postCount >= 2)
    throw new Error("Starter Account can only create 2 posts!");

  const localPath = `public/images/posts/${req.file.fileName}`;

  const uploadedImage = await cloudinaryUploadingImg(localPath);

  try {
    const post = await Post.create({
      ...req.body,
      image: uploadedImage?.url,
      user: _id,
    });

    await User.findByIdAndUpdate(
      _id,
      { $inc: { postCount: 1 } },
      { new: true }
    );

    res.json(post);

    fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

exports.findAllPosts = expressAsyncHandler(async (req, res) => {
  const chosenCategory = req.query.category;
  try {
    if (chosenCategory) {
      const posts = await Post.find({ category: chosenCategory })
        .populate("user")
        .populate("comments")
        .sort("-createdAt");

      res.json(posts);
    } else {
      const posts = await Post.find({})
        .populate("user")
        .populate("comments")
        .sort("-createdAt");

      res.json(posts);
    }
  } catch (error) {
    res.json(error);
  }
});

exports.findPost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validMongoId(id);

  try {
    const post = await Post.findById(id)
      .populate("user")
      .populate("likes")
      .populate("comments");
    await Post.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

exports.updatePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validMongoId(id);

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user: req.user?._id,
      },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

exports.deletePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validMongoId(id);

  try {
    const post = await Post.findByIdAndDelete(id);

    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

exports.togglePostLike = expressAsyncHandler(async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById(postId);

  const userId = req?.user?._id;
  const isLiked = post?.isLiked;
  const alreadyDisliked = post?.dislikes?.find(
    (post) => post?.toString() === userId.toString()
  );

  if (alreadyDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { dislikes: userId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(post);
  }

  // TOGGLE
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
        isLiked: false,
      },
      { new: true }
    );

    res.json(post);
  } else {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { likes: userId }, isLiked: true },
      { new: true }
    );

    res.json(post);
  }
});

exports.togglePostDislike = expressAsyncHandler(async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById(postId);

  const userId = req?.user?._id;
  const isDisliked = post?.isDisliked;
  const alreadyLiked = post?.likes?.find(
    (post) => post?.toString() === userId.toString()
  );

  if (alreadyLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }

  if (isDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { dislikes: userId },
        isDisliked: false,
      },
      { new: true }
    );

    res.json(post);
  } else {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { dislikes: userId }, isDisliked: true },
      { new: true }
    );

    res.json(post);
  }

  res.json("dislike");
});
