const { Router } = require("express");
const router = Router();
const mallController = require('../Controllers/mall');
const auth = require('../Middleware/Authentication')

//Create a new category
router.post('/add-mall', auth.verifyToken, auth.verifyUsertype, mallController.createmall);

//Get all category
router.get('/get-malls', auth.verifyToken, auth.verifyUsertype, mallController.getMalls);

module.exports = router;
