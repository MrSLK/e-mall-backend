const { Router } = require("express");
const router = Router();
const reportController = require('../Controllers/adminReport');
const auth = require('../Middleware/Authentication')

//Generate user report
router.post('/generate-user-report', auth.verifyToken, auth.verifyUsertype, reportController.userReport);

//Generate product report
router.get('/generate-product-report/:token', auth.verifyToken, auth.verifyUsertype, reportController.productReport);

module.exports = router;