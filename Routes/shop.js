const { Router } = require("express");
const router = Router();
const shopController = require('../Controllers/shop');
const auth = require('../Middleware/Authentication')

//Create a new shop
router.post('/add-shop', auth.verifyToken, auth.verifyUsertype, shopController.createShop);

//Get all shops
router.get('/get-shops', auth.verifyToken, auth.verifyUsertype, shopController.getShops);

module.exports = router;
