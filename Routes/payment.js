const express = require('express');
const router = express.Router();
const { validate } = require('../Middleware/validator');
const paymentController = require('../Controllers/payment');
const auth = require('../Middleware/Authentication')
 
 
router.get('/', paymentController.index);
router.post('/payment', validate('payment'), paymentController.payment);
router.post('/save-card', auth.verifyToken, paymentController.saveCard)

module.exports = router;