const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// connect to MongoDB
connectDB();

const app = express();

// middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
  'https://notesswap-mu.vercel.app/',
    'http://localhost:5173',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));