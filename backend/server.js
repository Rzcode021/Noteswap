const express = require('express');
const http = require('http'); // 👈 ADDED for Socket.io
const { Server } = require('socket.io'); // 👈 ADDED for Socket.io
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // 👈 Wrap express with http server

// ==========================================
// 🚀 SOCKET.IO SETUP
// ==========================================
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true)
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://notesswap-mu.vercel.app',
        'https://note-swap.smarttechbros.com',
        process.env.CLIENT_URL,
      ].filter(Boolean)
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  },
});

// Make io globally accessible in all controllers
app.set('io', io);

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User joins their personal room using their MongoDB user ID
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});
// ==========================================

// middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      "https://note-swap.smarttechbros.com",
      process.env.CLIENT_URL,
    ].filter(Boolean)
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/notes',    require('./routes/note.routes'));
app.use('/api/users',    require('./routes/user.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// health check
app.get('/', (req, res) => res.json({ message: 'NoteSwap API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// 🚨 CRITICAL: Use server.listen instead of app.listen!
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));