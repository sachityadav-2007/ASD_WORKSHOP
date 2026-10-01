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

module.exports = { readData, getAllProducts, getProductById };