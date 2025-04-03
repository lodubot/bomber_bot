import express from "express";
import mongoose from "mongoose";

import createBot, {
  handleWelcomeMessage,
  handleBombCommand,
  handleBlockCommand,
} from "./controllers/bot.controller.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log("error connecting to mongodb", err);
  });

const app = express();

const bot = createBot(process.env.BOT_TOKEN);

bot.onText(/\/start/, handleWelcomeMessage(bot));

bot.onText(/\/bomb (.+)/, handleBombCommand(bot));
bot.onText(/\/block (.+)/, handleBlockCommand(bot));

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

app.get("/", (req, res) => {
  res.send("server is working");
});

app.listen(8005, () => {
  console.log("server is running at port 8005");
});
