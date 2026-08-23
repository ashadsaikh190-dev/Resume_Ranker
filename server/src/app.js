const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const resumeRoutes = require('./routes/resumeRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS — allow requests from the React frontend (any localhost port)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman) or any localhost
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('dev'));

// Routes
app.use('/api/resumes', resumeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
