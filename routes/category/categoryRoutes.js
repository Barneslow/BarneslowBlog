const express = require("express");
const categoryController = require("../../controllers/categoryController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const categoryRoutes = express.Router();

categoryRoutes
  .route("/")
  .post(authMiddleware, categoryController.createCategory)
  .get(categoryController.findCategories);

categoryRoutes
  .route("/:id")
  .get(categoryController.findCategory)
  .post(authMiddleware, categoryController.updateCategory)
  .delete(authMiddleware, categoryController.deleteCategory);

module.exports = categoryRoutes;
