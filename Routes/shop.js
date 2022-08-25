const { Router } = require("express");
const router = Router();
const shopController = require('../Controllers/shop');
const auth = require('../Middleware/Authentication')

//Create a new shop
router.post('/add-shop', auth.verifyToken, auth.verifyUsertype, shopController.createShop);

//Get all shops of a specific mall
router.get('/get-shops-for-a-mall', shopController.getShopsOfAMall);

//Get all shops
router.get('/get-shop', shopController.getShops);

module.exports = router;
