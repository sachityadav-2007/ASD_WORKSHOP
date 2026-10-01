const productService = require("../services/productService");

async function getAllProducts(req, res) {
  try {
    let products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getProductById(req, res) {
  try {
    let id = Number(req.params.id);
    let product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAllProducts, getProductById };