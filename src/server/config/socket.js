const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.userId);

    // Join user's personal room
    socket.join(socket.user.userId);

    // Handle private messages
    socket.on('private-message', async (data) => {
      const { recipientId, message } = data;
      io.to(recipientId).emit('new-message', {
        senderId: socket.user.userId,
        message,
      });
    });

    // Handle content updates
    socket.on('content-update', (data) => {
      io.to(data.creatorId).emit('creator-content-update', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.userId);
    });
  });

  return io;
};

module.exports = initializeSocket;