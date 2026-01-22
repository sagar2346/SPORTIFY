const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http'); // Import HTTP
const { Server } = require('socket.io'); // Import Socket.IO

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const venueRoutes = require('./routes/venues');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');
const messageRoutes = require('./routes/messages');
const teamRoutes = require('./routes/teams');
const kycRoutes = require('./routes/kyc');
const footageRoutes = require('./routes/footage');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
    console.log(`Attempting to connect to MongoDB...`);

    const conn = await mongoose.connect(connString);
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Tip: Make sure MongoDB is running locally (mongod) or check your connection string.');
    // Do not exit process, let it retry or stay up without DB
  }
};

connectDB();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined team: ${teamId}`);
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(teamId);
    console.log(`User ${socket.id} left team: ${teamId}`);
  });

  // Import GroupMessage model at the top
  const GroupMessage = require('./models/GroupMessage');

  // ... inside io.current logic

  socket.on('send_message', async (data) => {
    // data should contain { teamId, messageObject }
    // messageObject from client might lack _id, so we save to DB first to get it.

    try {
      // If it's a text message, save it. Voice messages are already saved via API and then emitted.
      // If the client sends a full message object (including _id) it means it was already saved (e.g. voice).
      // If it lacks _id, it's a new text message.

      let messageToEmit = data.message;

      if (!data.message._id && data.message.type === 'text') {
        const newMessage = await GroupMessage.create({
          team: data.teamId,
          sender: data.message.sender,
          senderName: data.message.senderName,
          content: data.message.content,
          type: 'text',
          createdAt: new Date()
        });
        messageToEmit = newMessage;
      }

      // Broadcast to everyone in the room
      io.to(data.teamId).emit('receive_message', messageToEmit);

    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/footage', footageRoutes);
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied for port ${PORT}. (On Windows, ports like 5000 are often restricted)`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server connected to socket running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

