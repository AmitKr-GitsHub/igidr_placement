const { Telegraf } = require('telegraf');
const { ChatRoomType } = require('@prisma/client');

const TELEGRAM_MAX_MESSAGE_LENGTH = 4000;

function normalizeIncomingText(text) {
  if (typeof text !== 'string') {
    throw new Error('Incoming Telegram message must be text.');
  }

  const normalized = text.trim();
  if (!normalized) {
    throw new Error('Message content cannot be empty.');
  }

  if (normalized.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
    throw new Error(`Message is too long (max ${TELEGRAM_MAX_MESSAGE_LENGTH} characters).`);
  }

  return normalized;
}

function getDmRoomNameForUser(userId) {
  return `dm-user-${userId}`;
}

async function findOrCreateDmRoom(prisma, userId) {
  const roomName = getDmRoomNameForUser(userId);

  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      type: ChatRoomType.DM,
      name: roomName
    },
    select: {
      id: true,
      name: true,
      type: true
    }
  });

  if (existingRoom) {
    return existingRoom;
  }

  return prisma.chatRoom.create({
    data: {
      name: roomName,
      type: ChatRoomType.DM
    },
    select: {
      id: true,
      name: true,
      type: true
    }
  });
}

function initializeTelegramBot({ botToken, prisma, io, getSocketRoomName, logger = console }) {
  if (!botToken) {
    logger.warn('TELEGRAM_BOT_TOKEN is not set. Telegram integration is disabled.');
    return null;
  }

  const bot = new Telegraf(botToken);

  bot.catch((err, ctx) => {
    logger.error('Unhandled Telegram bot error:', err);
    if (ctx && ctx.reply) {
      ctx.reply('Something went wrong while processing your message. Please try again.').catch(() => {});
    }
  });

  bot.on('text', async (ctx) => {
    try {
      const telegramUserId = String(ctx.from?.id || '').trim();
      if (!telegramUserId) {
        await ctx.reply('Unable to identify your Telegram account. Please contact the administrator.');
        return;
      }

      const content = normalizeIncomingText(ctx.message?.text);

      const user = await prisma.user.findUnique({
        where: { telegramId: telegramUserId },
        select: { id: true, name: true }
      });

      if (!user) {
        await ctx.reply('Your Telegram account is not linked yet. Please ask admin to link your telegramId.');
        return;
      }

      const dmRoom = await findOrCreateDmRoom(prisma, user.id);

      const savedMessage = await prisma.message.create({
        data: {
          content,
          senderId: user.id,
          roomId: dmRoom.id,
          isAgentGenerated: false
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

      const socketRoomName = getSocketRoomName(ChatRoomType.DM, dmRoom.id);
      const outgoingMessage = {
        ...savedMessage,
        senderName: user.name,
        roomType: ChatRoomType.DM,
        source: 'telegram'
      };

      io.to(socketRoomName).emit('newMessage', outgoingMessage);
      io.emit('telegramMessage', outgoingMessage);

      await ctx.reply('✅ Message synced to your web chat DM room.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process Telegram message.';
      logger.error('Telegram message handling error:', message);
      await ctx.reply(`⚠️ Could not sync message: ${message}`);
    }
  });

  bot.launch().then(() => {
    logger.info('Telegram bot started successfully.');
  }).catch((error) => {
    logger.error('Failed to start Telegram bot:', error);
  });

  return bot;
}

module.exports = {
  initializeTelegramBot,
  getDmRoomNameForUser
};
