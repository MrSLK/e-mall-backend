const { Router } = require("express");
const productController = require("../Controllers/product");
const router = Router();

router.post('/upload-docs', productController.uploadDocs)

module.exports = router;
