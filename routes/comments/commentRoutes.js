const express = require("express");
const commentController = require("../../controllers/commentController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const commentRoutes = express.Router();

commentRoutes
  .route("/")
  .post(authMiddleware, commentController.createComment)
  .get(commentController.findComments);

commentRoutes
  .route("/:id")
  .get(authMiddleware, commentController.findComment)
  .post(authMiddleware, commentController.updateComment)
  .delete(authMiddleware, commentController.deleteComment);

module.exports = commentRoutes;
