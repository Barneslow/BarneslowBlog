const express = require("express");
const userController = require("../../controllers/usersController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  photoUpload,
  profilePhotoResize,
} = require("../../middlewares/upload/photoUpload");

const userRoutes = express.Router();

userRoutes.route("/").get(authMiddleware, userController.getAllUsers);
userRoutes.route("/").put(authMiddleware, userController.updateUser);

userRoutes.route("/register").post(userController.registerUser);
userRoutes.route("/login").post(userController.loginUser);
userRoutes
  .route("/password/")
  .put(authMiddleware, userController.updatedPassword);
userRoutes.route("/forget-password").post(userController.forgetPasswordToken);
userRoutes.route("/password-reset").post(userController.passwordReset);
userRoutes
  .route("/upload-profile-photo")
  .post(
    authMiddleware,
    photoUpload.single("image"),
    profilePhotoResize,
    userController.profilePhotoUpload
  );

userRoutes.route("/follow").post(authMiddleware, userController.followingUser);
userRoutes.route("/unfollow").post(authMiddleware, userController.unfollowUser);
userRoutes
  .route("/send-verification")
  .post(authMiddleware, userController.generateVerificationToken);
userRoutes
  .route("/account-verification")
  .post(authMiddleware, userController.accountVerifcation);

userRoutes
  .route("/block-user/:id")
  .put(authMiddleware, userController.blockUser);

userRoutes
  .route("/unblock-user/:id")
  .put(authMiddleware, userController.unBlockUser);

userRoutes.route("/:id").get(userController.findUser);
userRoutes.route("/:id").delete(userController.deleteUser);

userRoutes
  .route("/profile/:id")
  .get(authMiddleware, userController.userProfile);

module.exports = userRoutes;
