const express = require("express");
const postController = require("../../controllers/postController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const {
  photoUpload,
  postImageResize,
} = require("../../middlewares/upload/photoUpload");
const postRoutes = express.Router();

postRoutes
  .route("/")
  .post(
    authMiddleware,
    photoUpload.single("image"),
    postImageResize,
    postController.createPost
  );

postRoutes.route("/likes").post(authMiddleware, postController.togglePostLike);
postRoutes
  .route("/dislikes")
  .post(authMiddleware, postController.togglePostDislike);

postRoutes.route("/").get(postController.findAllPosts);
postRoutes.route("/:id").get(postController.findPost);
postRoutes.route("/:id").post(authMiddleware, postController.updatePost);
postRoutes.route("/:id").delete(authMiddleware, postController.deletePost);

module.exports = postRoutes;
