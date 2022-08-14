const { Router } = require("express");
const router = Router();
const userController = require('../Controllers/user');
const auth = require('../Middleware/Authentication')

//Login
router.post('/login', userController.login);

//Regtration
router.post('/registration', userController.registration);

//Update user
router.post('/update-profile', auth.verifyToken, userController.updateProfile);

module.exports = router;