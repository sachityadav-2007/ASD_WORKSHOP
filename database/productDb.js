const fs = require("fs/promises");
const path = require("path");

const filePath = path.join(__dirname, "..", "db.json");

async function readData() {
  let products = await fs.readFile(filePath, "utf-8");
  return JSON.parse(products);
}

async function delay() {
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
  return await readData();
}

async function getAllProducts() {
  return await delay();
}

async function getProductById(id) {
  let products = await delay();
  return products.find((x) => x.id === id);
}
async function writeData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function addProduct(product) {
  let products = await readData();
  products.push(product);
  await writeData(products);
  return product;
}

async function updateProduct(id, newData) {
  let products = await readData();
  let index = products.findIndex((x) => x.id === id);
  if (index === -1) {
    return null;
  }
  products[index] = { ...products[index], ...newData, id: id };
  await writeData(products);
  return products[index];
}

async function deleteProduct(id) {
  let products = await readData();
  let index = products.findIndex((x) => x.id === id);
  if (index === -1) {
    return false;
  }
  products.splice(index, 1);
  await writeData(products);
  return true;
}

module.exports = {
  readData,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};

