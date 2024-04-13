const Product = require('../models/product');
const ProductCategory = require('../models/productCategory');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const db = process.env.MONGODB;

exports.index = asyncHandler(async function (req, res, next) {
  await mongoose.connect(db);
  const productCount = await Product.find({}, 'title').countDocuments();
  const categoryCount = await ProductCategory.find({}, 'title').countDocuments();
  res.render('index', {
    title: 'Home page',
    productCount,
    categoryCount
  });
  await mongoose.connection.close();
});
exports.product_list = asyncHandler();
exports.product_detail = asyncHandler();
exports.product_create_get = asyncHandler();
exports.product_create_post = asyncHandler();
exports.product_delete_get = asyncHandler();
exports.product_delete_post = asyncHandler();
exports.product_update_get = asyncHandler();
exports.product_update_post = asyncHandler();

