const { Router } = require("express");
const router = Router();
const addressController = require('../Controllers/address');
const auth = require('../Middleware/Authentication')

//Create a new address
router.post('/add-address', auth.verifyToken, addressController.saveAddress);

//Update the address
router.post('/update-address', auth.verifyToken, addressController.updateAddress);

//Delete the address
router.delete('/delete-address', auth.verifyToken, addressController.deleteAddress);

//Get address
router.get('/get-address/:token', auth.verifyToken, addressController.getUserAddress);

module.exports = router;
