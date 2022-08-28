const { Router } = require("express");
const router = Router();
const cartController = require('../Controllers/cart');
const auth = require('../Middleware/Authentication')

//Add to cart
router.post('/add-to-cart', auth.verifyToken, cartController.addToCart);

//Change cart status
router.get('/update-cart-status/:token', auth.verifyToken, cartController.changeCartStatus);

//Delete cart
router.delete('/delete-from-cart', auth.verifyToken, cartController.removeFromCart);

//Get from cart
router.get('/get-from-cart', auth.verifyToken, cartController.getFromCart);

module.exports = router;