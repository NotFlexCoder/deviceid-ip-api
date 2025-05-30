const { MongoClient } = require('mongodb');

if (!process.env.MONGO_URI) {
  require('dotenv').config();
}

let cachedClient = null;

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const device = (req.headers['user-agent'] || '').trim();
  const deleteMode = req.query.delete === 'true';
  const sharedIp = req.query.ip;
  const sharedDevice = req.query.device ? decodeURIComponent(req.query.device).trim() : null;

  const uri = process.env.MONGO_URI;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const db = cachedClient.db('tracker');
  const collection = db.collection('logs');

  if (deleteMode) {
    if (!sharedIp || !sharedDevice) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'ip and device query params required for delete' }));
    }

    const result = await collection.deleteMany({ ip: sharedIp, device: sharedDevice });
    const stillExists = await collection.findOne({ ip: sharedIp, device: sharedDevice });

    return res.end(JSON.stringify({
      status: result.deletedCount > 0 ? 'deleted' : 'not_found',
      deletedCount: result.deletedCount,
      stillExists: !!stillExists,
      ip: sharedIp,
      device: sharedDevice
    }));
  }

  const exists = await collection.findOne({ ip, device });

  if (exists) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ error: 'Already used', ip, device }));
  }

  const entry = { ip, device, time: new Date().toISOString() };
  await collection.insertOne(entry);

  res.end(JSON.stringify({ status: 'saved', ip, device }));
};
