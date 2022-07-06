const expressAsyncHandler = require("express-async-handler");
const Comment = require("../models/comments/comments");
const validMongoId = require("../utils/validateMongooseId");
const { isBlocked } = require("../utils/isBlocked");

exports.createComment = expressAsyncHandler(async (req, res) => {
  const user = req.user;

  isBlocked(req.user);

  const { postId, description } = req.body;

  try {
    const comment = await Comment.create({
      post: postId,
      user,
      description,
    });
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

exports.findComments = expressAsyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find({}).sort("-created");

    res.json(comments);
  } catch (error) {
    res.json(error);
  }
});

exports.findComment = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);

    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

exports.updateComment = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const update = await Comment.findByIdAndUpdate(
      id,
      {
        post: req.body.postId,
        user: req?.user,
        description: req.body.description,
      },
      { new: true, runValidators: true }
    );

    res.json(update);
  } catch (error) {
    res.json(error);
  }
});

exports.deleteComment = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validMongoId(id);

  try {
    const comment = await Comment.findByIdAndDelete(id);
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});
