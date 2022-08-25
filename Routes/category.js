const { Router } = require("express");
const router = Router();
const categoryController = require('../Controllers/category');
const auth = require('../Middleware/Authentication')

//Create a new category
router.post('/add-category', auth.verifyToken, auth.verifyUsertype, categoryController.createCategory);

//Get all category
router.get('/get-all-categories', categoryController.getAllCategories);

module.exports = router;
