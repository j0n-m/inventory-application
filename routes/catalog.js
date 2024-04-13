const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productCategoryController = require('../controllers/productCategoryController');

router.get('/', productController.index);

module.exports = router;