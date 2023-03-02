const { Router } = require("express");
const router = Router();
const orderHistory = require('../Controllers/orderHistory');
const auth = require('../Middleware/Authentication')

router.get('/historical-orders/:token', auth.verifyToken, orderHistory.orderHistory);

module.exports = router;