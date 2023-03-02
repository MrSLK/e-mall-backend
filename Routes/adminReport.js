const { Router } = require("express");
const router = Router();
const reportController = require('../Controllers/adminReport');
const auth = require('../Middleware/Authentication')

//Generate user report
router.get('/generate-user-report/:user_id', reportController.userReport);

//Generate a product report
router.get('/generate-product-report', reportController.productReport);

//Generate a sales report
router.get('/generate-sales-report', reportController.salesReport);


//Generate a sales report for display
router.get('/generate-sales-report-for-display', reportController.salesReport);

//Generate a product report for display
router.get('/generate-product-report-for-display', reportController.productReportObject);

module.exports = router;