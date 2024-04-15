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
    title: 'Create a new Category',
  })
});
exports.category_create_post = [
  body('category_name', 'Name must be at least 2 characters in length').trim().isLength({ min: 2 }).escape(),
  body('category_description').trim().optional({ values: 'falsy' }).escape(),
  asyncHandler(async (req, res, next) => {
    await mongoose.connect(db);
    const errors = validationResult(req);
    const category = new ProductCategory({
      name: req.body.category_name,
      description: req.body.category_description,
    });
    if (!errors.isEmpty()) {
      res.render('productCategory_form', {
        title: 'Create a new Category',
        category,
        errors: errors.array()
      })
    } else {
      //valid form data
      //check for duplicates before saving to db
      const dupeCategory = await ProductCategory.findOne({ name: category.name }).exec();
      if (dupeCategory) {
        //is a duplicate category
        res.redirect(dupeCategory.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
    mongoose.connection.close();
  })];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const [category, productsByCategory] = await Promise.all([
    ProductCategory.findById(req.params.id),
    Product.find({ category: req.params.id }, 'name').sort({ name: 1 })
  ]);
  if (category == null) {
    res.redirect('/catalog/categories');
  } else {
    res.render('productCategory_delete', {
      title: 'Delete Category',
      category,
      productsByCategory
    })
  }

  mongoose.connection.close();
});
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const category = await ProductCategory.findById(req.body.category_id);

  if (category == null) {
    const error = new Error('Cannot delete a category that doesn\'t exist.')
    error.status = 404;
    next(error);
  }
  //otherwise, a valid category in the db
  await ProductCategory.findByIdAndDelete(category._id);
  res.redirect('/catalog/categories');

  mongoose.connection.close();
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  await mongoose.connect(db);
  const category = await ProductCategory.findById(req.params.id);
  if (category == null) {
    res.redirect('/catalog/categories');
  } else {
    res.render('productCategory_form', {
      title: 'Update category - ' + category.name,
      category,
      buttonName: 'Update',
    })
  }

  mongoose.connection.close();
});
exports.category_update_post = [
  body('category_name', 'Name must be at least 2 characters in length').trim().isLength({ min: 2 }).escape(),
  body('category_description').trim().optional({ values: 'falsy' }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new ProductCategory({
      name: req.body.category_name,
      description: req.body.category_description,
      _id: req.params.id
    });
    if (!errors.isEmpty()) {
      res.render('productCategory_form', {
        title: 'Update Category - ' + category.name,
        category,
        errors: errors.array()
      })
    } else {
      await mongoose.connect(db);
      //check if same is duplicate
      const dupeCategory = await ProductCategory.findOne({ name: category.name, description: category.description }).exec();
      if (dupeCategory == null) {
        await ProductCategory.findByIdAndUpdate(category._id, category);
        res.redirect(category.url);
      } else {
        res.redirect(dupeCategory.url);
      }

    }
    await mongoose.connection.close();
  })];