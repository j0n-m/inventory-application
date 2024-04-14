const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productCategoryController = require('../controllers/productCategoryController');

//--> /catalog{path-below}

//routes for getting list
router.get('/', productController.index);
router.get('/categories', productCategoryController.productCategory_list);
router.get('/products', productController.product_list);

//routes for REST API (GET/UPDATE/DELETE)
router.get('/category/create', productCategoryController.category_create_get)
router.post('/category/create', productCategoryController.category_create_post)

router.get('/product/create', productController.product_create_get)
router.post('/product/create', productController.product_create_post)

//routes for getting product/category details
router.get('/product/:id', productController.product_detail)
router.get('/category/:id', productCategoryController.productCategory_detail)

module.exports = router;