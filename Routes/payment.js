const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/payment');
const auth = require('../Middleware/Authentication')
 
router.post('/save-card', auth.verifyToken, paymentController.saveCard)

module.exports = router;