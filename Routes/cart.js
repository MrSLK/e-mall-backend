const { Router } = require("express");
const router = Router();
const cartController = require('../Controllers/cart');
const auth = require('../Middleware/Authentication')

//Proceed to checkout
router.post('/proceed-to-checkout', auth.verifyToken, cartController.proceedToCheckout);

module.exports = router;