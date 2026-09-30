const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const app = express();
let cache = {};

const filePath = path.join(__dirname, "db.json");
async function readData() {
  let products = await fs.readFile(filePath, "utf-8");
  return JSON.parse(products);
}

async function delay() {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1500);
  });
  return await readData();
}

app.get("/products", async (req, res) => {
  let key = req.url;

  let value = cache[key];


  try {
    if (value) {
      console.log("cache worked");
      return res.json(value);
    }

    let data = await delay();
    cache[key] = data;
    return res.json(data);
  } catch (err) {
    console.log(err);
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    let data = await delay();
    let id = Number(req.params.id);
    let specificData = data.find((x) => x.id === id);
    res.json(specificData);
  } catch (err) {
    console.log(err);
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3000");
});