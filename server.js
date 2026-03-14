const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient, ChatRoomType } = require('@prisma/client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const ROOM_PREFIX = {
  [ChatRoomType.ADMIN_PLACECOM]: 'admin-placecom',
  [ChatRoomType.PLACECOM_ONLY]: 'placecom-only',
  [ChatRoomType.DM]: 'dm'
};

function getSocketRoomName(roomType, roomId) {
  const prefix = ROOM_PREFIX[roomType];
  if (!prefix) {
    throw new Error(`Unsupported room type: ${roomType}`);
  }

  return `${prefix}:${roomId}`;
}

function parseRoomId(value) {
  const roomId = Number(value);
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new Error('Invalid roomId. It must be a positive integer.');
  }

  return roomId;
}

function parseUserId(value) {
  const userId = Number(value);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid senderId. It must be a positive integer.');
  }

  return userId;
}

function normalizeMessageContent(content) {
  if (typeof content !== 'string') {
    throw new Error('Message content must be a string.');
  }

  const normalized = content.trim();
  if (!normalized) {
    throw new Error('Message content cannot be empty.');
  }

  if (normalized.length > 4000) {
    throw new Error('Message content is too long (max 4000 characters).');
  }

  return normalized;
}

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('joinRoom', async (payload, ack) => {
    try {
      const roomId = parseRoomId(payload?.roomId);
      const roomType = payload?.roomType;

      if (!roomType || !ROOM_PREFIX[roomType]) {
        throw new Error('Invalid roomType. Allowed: ADMIN_PLACECOM, PLACECOM_ONLY, DM.');
      }

      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { id: true, name: true, type: true }
      });

      if (!room) {
        throw new Error('Chat room not found.');
      }

      if (room.type !== roomType) {
        throw new Error('Room type mismatch for the specified chat room.');
      }

      const socketRoomName = getSocketRoomName(roomType, roomId);
      await socket.join(socketRoomName);

      const response = {
        success: true,
        room: {
          id: room.id,
          name: room.name,
          type: room.type,
          socketRoomName
        }
      };

      if (typeof ack === 'function') {
        ack(response);
      }

      socket.emit('joinedRoom', response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to join room.';
      const response = { success: false, error: message };

      if (typeof ack === 'function') {
        ack(response);
      }

      socket.emit('socketError', response);
    }
  });

  socket.on('sendMessage', async (payload, ack) => {
    try {
      const roomId = parseRoomId(payload?.roomId);
      const senderId = parseUserId(payload?.senderId);
      const roomType = payload?.roomType;
      const content = normalizeMessageContent(payload?.content);
      const isAgentGenerated = Boolean(payload?.isAgentGenerated);

      if (!roomType || !ROOM_PREFIX[roomType]) {
        throw new Error('Invalid roomType. Allowed: ADMIN_PLACECOM, PLACECOM_ONLY, DM.');
      }

      const [room, sender] = await Promise.all([
        prisma.chatRoom.findUnique({
          where: { id: roomId },
          select: { id: true, name: true, type: true }
        }),
        prisma.user.findUnique({
          where: { id: senderId },
          select: { id: true, name: true, role: true }
        })
      ]);

      if (!room) {
        throw new Error('Chat room not found.');
      }

      if (room.type !== roomType) {
        throw new Error('Room type mismatch for the specified chat room.');
      }

      if (!sender) {
        throw new Error('Sender not found.');
      }

      const savedMessage = await prisma.message.create({
        data: {
          content,
          senderId,
          roomId,
          isAgentGenerated
        },
        select: {
          id: true,
          content: true,
          senderId: true,
          roomId: true,
          timestamp: true,
          isAgentGenerated: true
        }
      });

      const socketRoomName = getSocketRoomName(roomType, roomId);
      const messageEvent = {
        success: true,
        message: {
          ...savedMessage,
          senderName: sender.name,
          roomType
        }
      };

      io.to(socketRoomName).emit('newMessage', messageEvent.message);

      if (typeof ack === 'function') {
        ack(messageEvent);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message.';
      const response = { success: false, error: message };

      if (typeof ack === 'function') {
        ack(response);
      }

      socket.emit('socketError', response);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

async function start() {
  try {
    await prisma.$connect();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
}

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});
