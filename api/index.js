const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
  return app(req, res);
};
