const Product = require('../models/product');
const ProductCategory = require('../models/productCategory');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const db = process.env.MONGODB;

exports.productCategory_list = asyncHandler();
exports.productCategory_detail = asyncHandler();
exports.productCategory_create_get = asyncHandler();
exports.productCategory_create_post = asyncHandler();
exports.productCategory_delete_get = asyncHandler();
exports.productCategory_delete_post = asyncHandler();
exports.productCategory_update_get = asyncHandler();
exports.productCategory_update_post = asyncHandler();