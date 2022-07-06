const expressAsyncHandler = require("express-async-handler");
const Category = require("../models/category/category");
const validMongoId = require("../utils/validateMongooseId");

exports.createCategory = expressAsyncHandler(async (req, res) => {
  try {
    const category = await Category.create({
      user: req.user._id,
      title: req.body.title,
    });

    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

exports.findCategories = expressAsyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate("user")
      .sort("-createdAt");

    res.json(categories);
  } catch (error) {
    res.json(error);
  }
});

exports.findCategory = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const categories = await Category.findById(id)
      .populate("user")
      .sort("-createdAt");

    res.json(categories);
  } catch (error) {
    res.json(error);
  }
});

exports.updateCategory = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const categories = await Category.findByIdAndUpdate(
      id,
      {
        title: req?.body?.title,
      },
      { new: true, runValidators: true }
    );

    res.json(categories);
  } catch (error) {
    res.json(error);
  }
});

exports.deleteCategory = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);

    res.json(category);
  } catch (error) {
    res.json(error);
  }
});
