const { MongoClient } = require('mongodb');

if (!process.env.MONGO_URI) {
  require('dotenv').config();
}

let cachedClient = null;

module.exports = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const mobileId = req.headers['user-agent'] || 'unknown';
  const query = req.query;
  const uri = process.env.MONGO_URI;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const db = cachedClient.db('tracker');
  const collection = db.collection('logs');

  if (req.method === 'GET') {
    if (query.edit === 'true' && query.oldMobile && query.newMobile) {
      const result = await collection.updateOne(
        { mobileId: query.oldMobile, ip },
        { $set: { mobileId: query.newMobile } }
      );
      if (result.matchedCount === 0) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Record not found to edit' }));
      }
      return res.end(JSON.stringify({ status: 'updated', ip, newMobile: query.newMobile }));
    }

    if (query.delete === 'true' && query.mobile) {
      const result = await collection.deleteOne({ mobileId: query.mobile, ip });
      if (result.deletedCount === 0) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Record not found to delete' }));
      }
      return res.end(JSON.stringify({ status: 'deleted', ip, mobile: query.mobile }));
    }

    const exists = await collection.findOne({ mobileId, ip });
    if (exists) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'Device already registered', ip, mobileId }));
    }

    const entry = { ip, mobileId, time: new Date().toISOString() };
    await collection.insertOne(entry);
    return res.end(JSON.stringify({ status: 'saved', ip, mobileId }));
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
