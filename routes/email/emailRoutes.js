const express = require("express");
const messageController = require("../../controllers/messageController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const messageRoutes = express.Router();

messageRoutes
  .route("/")
  .post(authMiddleware, messageController.sendEmailMessage);

module.exports = messageRoutes;
