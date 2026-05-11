require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'blog-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;
