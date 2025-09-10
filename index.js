import express from "express";
import chalk from "chalk";
import mongoose from "mongoose";

import createBot, {
  handleWelcomeMessage,
  handleBombCommand,
  handleBlockCommand,
} from "./controllers/bot.controller.js";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.green("✅ Connected to MongoDB"));
  })
  .catch((err) => {
    console.log(chalk.red("❌ Error connecting to MongoDB:"), err);
  });

const app = express();

// Initialize bot
const bot = createBot(process.env.BOT_TOKEN);

if (!bot) {
  console.error(chalk.red("❌ Failed to initialize bot. Check BOT_TOKEN."));
  process.exit(1);
}

// Register bot commands
bot.onText(/\/start/, (msg) => handleWelcomeMessage(bot, msg));
bot.onText(/\/bomb (.+)/, (msg, match) => handleBombCommand(bot, msg, match));
bot.onText(/\/block (.+)/, (msg, match) => handleBlockCommand(bot, msg, match));

// Handle button callbacks
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === "bomb") {
    bot.sendMessage(
      msg.chat.id,
      "Please use the /bomb command followed by a phone number.\n\nExample: /bomb 1234567890"
    );
  } else if (data === "block") {
    bot.sendMessage(
      msg.chat.id,
      "Please use the /block command followed by a phone number.\n\nExample: /block 1234567890"
    );
  }
});

// Express route
app.get("/", (req, res) => {
  res.send("✅ Server is working");
});

// Start server
const port = process.env.PORT || 8005;
app.listen(port, () => {
  console.log(chalk.blue(`🚀 Server is running at port ${port}`));
});
