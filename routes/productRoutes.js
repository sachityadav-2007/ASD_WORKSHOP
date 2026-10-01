const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { cacheMiddleware, invalidateCache } = require("../middleware/cacheMiddleware");

// router.get("/", productController.getAllProducts);
// router.get("/:id", productController.getProductById);
router.get("/", cacheMiddleware, productController.getAllProducts);
router.get("/:id", cacheMiddleware, productController.getProductById);
router.post("/", invalidateCache, productController.createProduct);
router.put("/:id", invalidateCache, productController.updateProduct);
router.patch("/:id", invalidateCache, productController.updateProduct);
router.delete("/:id", invalidateCache, productController.deleteProduct);

module.exports = router;