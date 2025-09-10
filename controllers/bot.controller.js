import chalk from "chalk";
import TelegramBot from "node-telegram-bot-api";
import Scheduler from "../lib/messageQueue.js";
import sendSMS from "../controllers/sms.controller.js";
import userModel from "../schema/user.model.js";
import historyModel from "../schema/history.model.js";
import blockModel from "../schema/block.model.js";

const scheduler = new Scheduler(2);

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

export const handleWelcomeMessage = (bot) => async (msg) => {
  const { id: chatId, first_name } = msg.chat;
  const userId = msg.from.id;
  const userName = msg.chat.username || msg.from.username;

  try {
    const user = await userModel.findOne({ userName });

    if (!user) {
      await userModel.create({ firstName: first_name, userName, userId });
    } else {
      await userModel.updateOne(
        { userName },
        { firstName: first_name, userId }
      );
    }

    console.log(chalk.green(`✅ User ${userName} (${chatId}) joined/updated`));

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
  } catch (err) {
    console.error(chalk.red("❌ Error in welcome handler:"), err);
  }
};

async function sendBombMessage(bot, chatId, phoneNumber, msgCount, delay) {
  try {
    const user = await blockModel.findOne({ phoneNumber });
    if (user) {
      return bot.sendMessage(chatId, `❌ ${phoneNumber} is blocked!`);
    }

    await historyModel.create({ userId: chatId, phoneNumber, msgCount });

    bot.sendMessage(
      chatId,
      `💣 Bombing on ${phoneNumber} with ${msgCount} messages! has been started`
    );
    console.log(
      chalk.yellow(`💣 Bombing started for ${phoneNumber} (${msgCount} msgs)`)
    );

    // Simulate SMS sending with delay
    await sendSMS(phoneNumber, msgCount, delay);

    bot.sendMessage(
      chatId,
      `✅ Bombing on ${phoneNumber} with ${msgCount} messages! has been completed`
    );
    console.log(chalk.green(`✅ Bombing completed for ${phoneNumber}`));
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error occurred while bombing ${phoneNumber}`);
    console.error(chalk.red("❌ Error in bomb command:"), error);
  }
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
    const msgCount = parseInt(args[1]) || 5;
    const delay = parseInt(args[2]) || 1000;

    if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(phoneNumber)) {
      return bot.sendMessage(
        chatId,
        "❌ Invalid phone number format. Please use international format (e.g., +1234567890)"
      );
    }

    bot.sendMessage(
      chatId,
      `💣 Starting bomb attack on ${phoneNumber}\n` +
        `Bombing with ${msgCount} messages (delay ${delay}ms)`
    );

    scheduler.addTask(() =>
      sendBombMessage(bot, chatId, phoneNumber, msgCount, delay)
    );
  } catch (error) {
    console.error(chalk.red("❌ Error in bomb command:"), error);
    bot.sendMessage(
      msg.chat.id,
      "❌ An error occurred while processing your request."
    );
  }
};

export const handleBlockCommand = (bot) => (msg, match) => {
  const { id: chatId } = msg.chat;
  const phoneNumber = match[1]?.trim();

  if (!phoneNumber) {
    return bot.sendMessage(
      chatId,
      "Usage: /block +1234567890\nExample: /block +1234567890"
    );
  }

  if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(phoneNumber)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid phone number format. Please use international format (e.g., +1234567890)"
    );
  }

  blockModel
    .findOne({ phoneNumber })
    .then((user) => {
      if (user) {
        bot.sendMessage(chatId, `❌ ${phoneNumber} is already blocked!`);
      } else {
        blockModel.create({ userId: chatId, phoneNumber });
        bot.sendMessage(chatId, `✅ ${phoneNumber} has been blocked!`);
        console.log(chalk.blue(`🔒 Number blocked: ${phoneNumber}`));
      }
    })
    .catch((err) => {
      console.error(chalk.red("❌ Error in block command:"), err);
      bot.sendMessage(
        chatId,
        "❌ An error occurred while blocking the number."
      );
    });
};

export default createBot;
