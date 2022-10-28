const { Router } = require("express");
const router = Router();
const reportController = require('../Controllers/adminReport');
const auth = require('../Middleware/Authentication')

//Generate user report
router.post('/generate-user-report', reportController.userReport);

//Generate product report
router.get('/generate-product-report/:token', reportController.productReport);

module.exports = router;