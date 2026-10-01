let cache = {};
const TTL = 60 * 1000;

function cacheMiddleware(req, res, next) {
  let key = req.originalUrl;
  let entry = cache[key];

  if (entry) {
    let age = Date.now() - entry.createdAt;
    if (age < TTL) {
      res.set("X-Cache", "HIT");
      return res.json(entry.data);
    }
    delete cache[key];
  }

  res.set("X-Cache", "MISS");

  let originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      cache[key] = { data: body, createdAt: Date.now() };
    }
    return originalJson(body);
  };

  next();
}

module.exports = { cacheMiddleware };