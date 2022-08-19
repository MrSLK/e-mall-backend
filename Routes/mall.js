const { Router } = require("express");
const router = Router();
const mallController = require('../Controllers/mall');
const auth = require('../Middleware/Authentication')

//Create a new mall
router.post('/add-mall', auth.verifyToken, auth.verifyUsertype, mallController.createMall);

//Get all malls
router.get('/get-malls', auth.verifyToken, auth.verifyUsertype, mallController.getMalls);

module.exports = router;
