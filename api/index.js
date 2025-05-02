const { MongoClient } = require('mongodb');

if (!process.env.MONGO_URI) {
  require('dotenv').config();
}

let cachedClient = null;

module.exports = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const device = req.headers['user-agent'];
  const entry = { ip, device, time: new Date().toISOString() };

  const uri = process.env.MONGO_URI;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const db = cachedClient.db('tracker');
  const collection = db.collection('logs');
  await collection.insertOne(entry);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'saved', ip, device }));
};
