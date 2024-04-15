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
exports.product_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.product_category)) {
      req.body.product_category =
        (typeof req.body.product_category == undefined) ? [] : [req.body.product_category]
    }
    next();
  },
  body('product_name', 'Name must have two or more characters.').trim().isLength({ min: 2 }).escape(),
  body('product_description').trim().optional({ values: 'falsy' }).escape(),
  body('product_price', 'Price must be between 0.00 and 9999.99.').isFloat({ min: 0.00, max: 9999.99 }).escape(),
  body('product_quantity', 'Quantity must be an integer value').isInt({ min: 0, max: 999 }).withMessage('Integer value must be between 0 and 999.').escape(),
  body('product_category.*', 'Select at least one category for this product.').isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    await mongoose.connect(db)
    const errors = validationResult(req);
    const product = new Product({
      name: req.body.product_name,
      description: req.body.product_description,
      price: req.body.product_price,
      quantity: req.body.product_quantity,
      category: req.body.product_category,
    })
    if (!errors.isEmpty()) {
      //resend form 
      const allCategories = await ProductCategory.find({}).sort({ name: 1 });

      for (const category of allCategories) {
        if (product.category.includes(category._id)) {
          category.checked = "true";
        }
      }
      res.render('product_form', {
        title: 'Create a new product',
        product,
        allCategories,
        errors: errors.array(),
      });
      await mongoose.connection.close();
    } else {
      const dupeProduct = await Product.findOne({ name: product.name });
      if (dupeProduct) {
        res.redirect(dupeProduct.url);
      } else {
        await product.save();
        console.log('saving:', product)
        res.redirect('/catalog/products');
      }
      await mongoose.connection.close();
    }
  })];
exports.product_delete_get = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const product = await Product.findById(req.params.id);
  mongoose.connection.close();
  if (product == null) {
    res.redirect('/catalog/products');
  } else {
    res.render('product_delete', {
      title: 'Delete product',
      product
    })
  }
});
exports.product_delete_post = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const product = await Product.findById(req.body.product_id);
  if (product == null) {
    const error = new Error('Cannot delete a product that doesn\'t exist.');
    error.status = 404;
    next(error);
  } else {
    await Product.findByIdAndDelete(product._id);
    res.redirect('/catalog/products');
  }
  mongoose.connection.close();
});

exports.product_update_get = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const [product, allCategories] = await Promise.all([
    Product.findById(req.params.id),
    ProductCategory.find({}, "name").sort({ name: 1 })
  ]);
  mongoose.connection.close();

  if (product == null) {
    console.log('error block')
    const error = new Error('Product not found.')
    error.status = 404;
    next(error);
  }
  for (const category of allCategories) {
    if (product.category.includes(category._id)) {
      category.checked = "true";
    }
  }
  res.render('product_form', {
    title: 'Update product',
    product,
    allCategories,
    buttonName: 'Update'
  })
});
exports.product_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.product_category)) {
      req.body.product_category =
        (typeof req.body.product_category == undefined ? [] : [req.body.product_category])
    }
    next();
  },
  body('product_name', 'Name must have two or more characters.').trim().isLength({ min: 2 }).escape(),
  body('product_description').trim().optional({ values: 'falsy' }).escape(),
  body('product_price', 'Price must be between 0.00 and 9999.99.').isFloat({ min: 0.00, max: 9999.99 }).escape(),
  body('product_quantity', 'Quantity must be an integer value').isInt({ min: 0, max: 999 }).withMessage('Integer value must be between 0 and 999.').escape(),
  body('product_category.*', 'Select at least one category for this product.').isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    await mongoose.connect(db);
    const errors = validationResult(req);
    const product = new Product({
      name: req.body.product_name,
      description: req.body.product_description,
      price: req.body.product_price,
      quantity: req.body.product_quantity,
      category: req.body.product_category,
      _id: req.params.id,
    });
    if (product.category.length == 0) {
      const error = new Error('Select a valid product category');
      error.status = 404;
      next(error);
    }
    if (!errors.isEmpty()) {
      //back to pre-filled form with error message
      const allCategories = await ProductCategory.find({}, 'name').sort({ name: 1 });
      res.render('product_form', {
        title: 'Update product',
        product,
        allCategories,
        buttonName: 'Update',
        errors: errors.array()
      })
    } else {
      await Product.findByIdAndUpdate(product._id, product);
      res.redirect(product.url);
    }
    mongoose.connection.close();

  })];

