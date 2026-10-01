const productDb = require("../database/productDb");

async function getAllProducts() {
  return await productDb.getAllProducts();
}

async function getProductById(id) {
  return await productDb.getProductById(id);
}

async function createProduct(data) {
  let products = await productDb.readData();
  let maxId = 0;
  for (let p of products) {
    if (p.id > maxId) {
      maxId = p.id;
    }
  }
  let newProduct = { id: maxId + 1, name: data.name, price: data.price };
  return await productDb.addProduct(newProduct);
}

async function updateProduct(id, data) {
  return await productDb.updateProduct(id, data);
}

async function deleteProduct(id) {
  return await productDb.deleteProduct(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};