const Product = require('../models/product');
const ProductCategory = require('../models/productCategory');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const db = process.env.MONGODB;

exports.index = asyncHandler(async function (req, res, next) {
  await mongoose.connect(db);
  const [productCount, categoryCount] = await Promise.all([
    Product.find({}, 'title').countDocuments(),
    ProductCategory.find({}, 'title').countDocuments()
  ])
  res.render('index', {
    title: 'Home page',
    productCount,
    categoryCount
  });
  await mongoose.connection.close();
});
exports.product_list = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const productList = await Product.find({}, "name").sort({ name: 1 });
  res.render('product_list', {
    title: 'All Products',
    productList
  })
  await mongoose.connection.close();
});

exports.product_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    // const error = new Error('Unknown Product.')
    // error.status = 404;
    // next(error);
    next() //uses the next middleware in line - the 404 page handler
  }
  await mongoose.connect(db);
  const product = await Product.findById(req.params.id).populate("category").exec();

  if (product == null) {
    const error = new Error('Product not found.');
    error.status = 404;
    next(error);
  }
  res.render('product_detail', {
    title: 'Product details',
    product,
  })

  await mongoose.connection.close();
});

exports.product_create_get = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const allCategories = await ProductCategory.find().sort({ name: 1 })
  res.render('product_form', {
    title: 'Create a new product',
    allCategories

  })
  await mongoose.connection.close();
});
exports.product_create_post = asyncHandler();
exports.product_delete_get = asyncHandler();
exports.product_delete_post = asyncHandler();
exports.product_update_get = asyncHandler();
exports.product_update_post = asyncHandler();

