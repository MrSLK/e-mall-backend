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

//Money allocation
router.get('/generate-money-allocation-report', reportController.moneyAllocation);

//Generate a sales report for display
router.get('/generate-sales-report-for-display', reportController.salesReport);

//Generate a product report for display
router.get('/generate-product-report-for-display', reportController.productReportObject);

//Generate a money allocation report 
router.get('/generate-money-allocation-report-for-display', reportController.moneyAllocationObject);

module.exports = router;