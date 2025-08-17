const express = require('express');
const cors = require('cors');
const app = express();

// 🔒 Allow only specific origins (deployed + local)
const allowedOrigins = [
  'https://fusionall.vercel.app', // ✅ Replace with your actual deployed frontend URL
  'http://localhost:3000'         // ✅ React local development
];

// CORS configuration
app.use(cors({
origin: function (origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    console.error('Blocked by CORS: ', origin);
    callback(new Error('CORS not allowed from this origin'), false);
  }
},
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middlewares
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/materials', require('./routes/materials'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ message: 'Backend working! ✅' });
});
app.get('/api/health', (req, res) => res.send('Backend is running!'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
