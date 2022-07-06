const User = require("../models/user/user");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/token");
const validMongoId = require("../utils/validateMongooseId");
const crypto = require("crypto");
const fs = require("fs");
const { validate } = require("../models/user/user");
const cloudinaryUploadingImg = require("../utils/cloudinary");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const sendGrid = require("@sendgrid/mail");
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.registerUser = expressAsyncHandler(async (req, res) => {
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");
  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

exports.loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // if (user?.isBlocked) throw new Error("Access Denied. You have been blocked");

  if (user && (await user.isPasswordMatched(password))) {
    res.json({
      _id: user._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      profilePhoto: user?.profilePhoto,
      isAdmin: user?.isAdmin,
      token: generateToken(user?.id),
      isVerified: user?.isAccountVerified,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

exports.getAllUsers = expressAsyncHandler(async (req, res) => {
  console.log(req.headers);
  try {
    const users = await User.find({}).populate("posts");
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validMongoId(id);

  try {
    const user = await User.findByIdAndDelete(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

exports.findUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validMongoId(id);

  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

exports.userProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validMongoId(id);

  const loginUserId = req?.user?._id.toString();
  try {
    const myProfile = await User.findById(id)
      .populate("posts")
      .populate("viewedBy");
    const viewedBy = myProfile?.viewedBy?.find((user) => {
      return user?._id?.toString() === loginUserId;
    });

    if (viewedBy) {
      res.json(myProfile);
    } else {
      const profile = await User.findByIdAndUpdate(myProfile?._id, {
        $push: { viewedBy: loginUserId },
      });
      res.json(profile);
    }
  } catch (error) {
    res.json(error);
  }
});

exports.updateUser = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;

  isBlocked(req.user);
  validMongoId(_id);

  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

exports.updatedPassword = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  const { password } = req?.body;

  validMongoId(_id);
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  }

  res.json(user);
});

exports.followingUser = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const userId = req.user.id;

  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === userId.toString()
  );

  if (alreadyFollowing) throw new Error("You are already following");

  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: userId },
      isFollowing: true,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    userId,
    {
      $push: { following: followId },
    },
    { new: true }
  );

  res.json("Following user!");
});

exports.unfollowUser = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const userId = req.user.id;

  await User.findByIdAndUpdate(
    followId,
    {
      $pull: { followers: userId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    userId,
    {
      $pull: { following: followId },
    },
    { new: true }
  );

  res.json("Unfollowed User");
});

exports.blockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validMongoId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );

  res.json(user);
});

exports.unBlockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validMongoId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );

  res.json(user);
});

exports.generateVerificationToken = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;

  const user = await User.findById(loginUserId);

  console.log(user?.email);

  try {
    const verificationToken = await user.createAccountVerificationToken();
    await user.save();

    const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/account-verification/${verificationToken}">Click to verify your account</a>`;
    const message = {
      to: user?.email,
      from: "darrachb1991@gmail.com",
      subject: "Verifiy Account",
      html: resetURL,
    };

    await sendGrid.send(message);
    res.json(resetURL);
  } catch (error) {
    res.json(error);
  }
});

exports.accountVerifcation = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!user) throw new Error("Token expired, try again later");

  user.isAccountVerified = true;
  user.accountVerificationToken = undefined;

  user.accountVerificationTokenExpires = undefined;
  await user.save();
  res.json(user);
});

exports.forgetPasswordToken = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  try {
    const token = await user.forgetPasswordToken();

    await user.save();

    const resetURL = `If you were requested to reset your password, reset now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/reset-password/${token}">Click to verify your account</a>`;
    const message = {
      to: email,
      from: "darrachb1991@gmail.com",
      subject: "Reset Password",
      html: resetURL,
    };

    const emailMessage = await sendGrid.send(message);
    res.json({
      message: `A password reset has been sent to the requested to ${email}. Reset here, ${resetURL}`,
    });
  } catch (error) {}

  res.send("forget password");
});

exports.passwordReset = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Token Expired, please try again later");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.json(user);
});

exports.profilePhotoUpload = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;

  isBlocked(req.user);

  const localPath = `public/images/profile/${req.file.fileName}`;

  const uploadedImage = await cloudinaryUploadingImg(localPath);

  const user = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: uploadedImage?.url,
    },
    {
      new: true,
    }
  );

  fs.unlinkSync(localPath);
  res.json(uploadedImage);
});
