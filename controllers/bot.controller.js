import TelegramBot from "node-telegram-bot-api";
import Scheduler from "../lib/messageQueue.js";
import sendSMS from "../controllers/sms.controller.js";

const scheduler = new Scheduler(2); // 1 concurrent task

const createBot = (token) => {
  const bot = new TelegramBot(token, {
    polling: {
      interval: 300,
      autoStart: true,
      params: {
        timeout: 10,
      },
    },
  });
  return bot;
};

export const handleWelcomeMessage = (bot) => (msg) => {
  const { id: chatId, first_name } = msg.chat;

  bot.sendMessage(
    chatId,
    `👋 Hey ${first_name}!\nWelcome to VandronXBot! 🤖\nI'm here to assist you with various features. Try out the buttons below to get started!`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💣💣 Bomb", callback_data: "bomb" },
            { text: "❌❌ Block", callback_data: "block" },
          ],
        ],
      },
    }
  );
};




async function sendBombMessage(bot, chatId, phoneNumber, msgCount) {

  return new Promise(async (resolve) => {
    try {
      bot.sendMessage(
        chatId,
        `Bombing on ${phoneNumber} with ${msgCount} messages! has been started`
      );
      resolve();
      await sendSMS(phoneNumber, msgCount);
    } catch (error) {
      bot.sendMessage(chatId, `❌ Error occurred while bombing ${phoneNumber}`);
      console.error("Error in bomb command:", error);
    }
  });
}

export const handleBombCommand = (bot) => (msg, match) => {
  try {
    const { id: chatId } = msg.chat;

    if (!match?.[1]) {
      return bot.sendMessage(
        chatId,
        "Usage: /bomb +1234567890 [msgCount=5] [delay=1000]\nExample: /bomb +1234567890 10 500"
      );
    }

    const args = match[1].trim().split(/\s+/);
    const phoneNumber = args[0];
    const msgCount = parseInt(args[1]) || 5; // Default 5 messages
    const delay = parseInt(args[2]) || 1000; // Default 1 second delay

    if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(phoneNumber)) {
      return bot.sendMessage(
        chatId,
        "❌ Invalid phone number format. Please use international format (e.g., +1234567890)"
      );
    }

    bot.sendMessage(
      chatId,
      `💣 Starting bomb attack on ${phoneNumber}\n` +
        `Sending ${msgCount} messages with ${delay}ms delay between each`
    );

    // Schedule the bomb messages as a single task
    scheduler.addTask(() =>
      sendBombMessage(bot, chatId, phoneNumber, msgCount, delay)
    );
  } catch (error) {
    console.error("Error in bomb command:", error);
    bot.sendMessage(
      msg.chat.id,
      "❌ An error occurred while processing your request."
    );
  }
};

export default createBot;
