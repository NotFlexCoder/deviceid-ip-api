const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const device = req.headers['user-agent'];
  const entry = { ip, device, time: new Date().toISOString() };
  const filePath = path.join(__dirname, '..', 'data.json');
  let data = [];
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content) data = JSON.parse(content);
  }
  data.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'saved', ip, device }));
};
