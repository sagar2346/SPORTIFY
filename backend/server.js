const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http'); // Import HTTP
const { Server } = require('socket.io'); // Import Socket.IO

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const User = require('./models/User');
const Team = require('./models/Team');
const logFile = fs.createWriteStream(path.join(__dirname, 'server_debug.log'), { flags: 'a' });
const origLog = console.log;
const origError = console.error;
const origWarn = console.warn;

console.log = (...args) => {
  logFile.write('LOG: ' + args.join(' ') + '\n');
  origLog.apply(console, args);
};
console.error = (...args) => {
  const message = args.map(arg => arg instanceof Error ? arg.stack : arg).join(' ');
  logFile.write('ERROR: ' + message + '\n');
  origError.apply(console, args);
};
console.warn = (...args) => {
  logFile.write('WARN: ' + args.join(' ') + '\n');
  origWarn.apply(console, args);
};

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
const connectDB = require('./config/database');

const startServer = async () => {
  try {
    await connectDB();

    // Reset all users to offline on server start
    await User.updateMany({}, { isOnline: false });
    console.log('All users reset to offline status');
  } catch (err) {
    console.error('Failed to initialize database related tasks:', err.message);
  }
};

startServer();

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

  socket.on('user_online', async (userId) => {
    try {
      if (userId) {
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, { isOnline: true });
        console.log(`User ${userId} (Socket ${socket.id}) is now online`);

        // Notify all teams this user is in
        const userTeams = await Team.find({ 'members.user': userId });
        userTeams.forEach(team => {
          io.to(team._id.toString()).emit('user_status_change', { userId, isOnline: true });
        });
      }
    } catch (err) {
      console.error('Error setting user online:', err);
    }
  });

  socket.on('join_team', async (teamId) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined team: ${teamId}`);

    // Proactively send online status of the person who just joined to everyone else in the team
    if (socket.userId) {
      io.to(teamId).emit('user_status_change', { userId: socket.userId, isOnline: true });
    }
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(teamId);
    console.log(`User ${socket.id} left team: ${teamId}`);
  });

  // Import GroupMessage model at the top
  const GroupMessage = require('./models/GroupMessage');

  socket.on('send_message', async (data) => {
    try {
      let messageToEmit = data.message;

      if (!data.message._id && data.message.type === 'text') {
        // Check if team is blocked
        const team = await Team.findById(data.teamId);
        if (team && team.isBlocked) {
          socket.emit('error', { message: 'This team is blocked. Messaging is disabled.' });
          return;
        }

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

      io.to(data.teamId).emit('receive_message', messageToEmit);

    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    const userId = socket.userId;
    if (userId) {
      try {
        // Wait a small bit to see if they reconnect (refresh)
        setTimeout(async () => {
          // Check if user has any other active connections
          const sockets = await io.fetchSockets();
          const isStillConnected = sockets.some(s => s.userId === userId);

          if (!isStillConnected) {
            await User.findByIdAndUpdate(userId, { isOnline: false });
            console.log(`User ${userId} is now offline (no active sockets left)`);
            // Notify all teams this user is in
            const userTeams = await Team.find({ 'members.user': userId });
            userTeams.forEach(team => {
              io.to(team._id.toString()).emit('user_status_change', { userId, isOnline: false });
            });
          } else {
            console.log(`User ${userId} disconnected from one tab but still online in others`);
          }
        }, 2000); // 2 second grace period for refreshes
      } catch (err) {
        console.error('Error setting user offline:', err);
      }
    }
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
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/analysis-requests', require('./routes/analysisRequests'));

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
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`Permission denied for port ${PORT}. (On Windows, ports like 5000 are often restricted)`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`Server connected to socket running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

