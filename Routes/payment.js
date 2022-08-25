const express = require('express');
const router = express.Router();
const { validate } = require('../Middleware/validator');
const paymentController = require('../Controllers/payment');
 
 
router.get('/', paymentController.index);
router.post('/payment', validate('payment'), paymentController.payment);

module.exports = router;