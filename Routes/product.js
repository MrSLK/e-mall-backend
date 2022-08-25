const { Router } = require("express");
const productController = require("../Controllers/product");
const authController = require("../Middleware/Authentication");
const router = Router();

//Create product
router.post('/add-product', authController.verifyToken, authController.verifyUsertype, productController.createProduct);

//Get all products
router.get('/get-all-products', productController.getAllProducts)

//Get products of a specific category
router.get('/get-products/:category_id', productController.getProducts)

module.exports = router;
