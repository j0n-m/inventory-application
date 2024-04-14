const Product = require('../models/product');
const ProductCategory = require('../models/productCategory');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const db = process.env.MONGODB;

exports.productCategory_list = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const categoryList = await ProductCategory.find({}, "name").sort({ name: 1 });
  res.render('productCategory_list', {
    title: 'All Product Categories',
    categoryList,
  })

  await mongoose.connection.close();
});

exports.productCategory_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    next();
  }
  await mongoose.connect(db);
  const [category, productsByCategory] = await Promise.all([
    ProductCategory.findById(req.params.id),
    Product.find({ category: req.params.id }).sort({ name: 1 }).exec()
  ])
  if (category == null) {
    const error = new Error('Category not found.')
    error.status = 404;
    next(error);
  }
  res.render('productCategory_detail', {
    title: 'Category Details',
    category,
    productsByCategory
  })
  await mongoose.connection.close();
});
exports.category_create_get = asyncHandler(async (req, res, next) => {
  //show blank form with populated selections from db query
  // const allCategories = await ProductCategory.find({},'name').sort({name:1})
  res.render('productCategory_form', {
    title: 'Create a new product category',
  })
});
exports.category_create_post = asyncHandler(async (req, res, next) => {
  res.send('posted form')
});
exports.category_delete_get = asyncHandler();
exports.category_delete_post = asyncHandler();
exports.category_update_get = asyncHandler();
exports.category_update_post = asyncHandler();