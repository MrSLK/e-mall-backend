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

//Update password
router.post('/update-password', auth.verifyToken, userController.updatePassword);

//get all users
router.get('/get-all/:token', auth.verifyToken, auth.verifyUsertype, userController.getUsers);

//Update password
router.post('/forgot-password', userController.forgotPassword);

module.exports = router;