const { Router } = require("express");
const router = Router();
const reportController = require('../Controllers/adminReport');
const auth = require('../Middleware/Authentication')

//Create a new address 
router.post('/generate-report', auth.verifyToken, auth.verifyUsertype, reportController.createReport);

module.exports = router;