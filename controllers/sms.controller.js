import chalk from "chalk";
import * as clients from "../lib/sms.js";

async function sendSMS(number, msgs, delay = 1000) {
  let totalSent = 0;

  for (let i = 0; i < msgs; i++) {
    for (let clientName in clients) {
      if (totalSent >= msgs) {
        console.log(chalk.green(`✅ Sent ${totalSent}/${msgs} messages`));
        return "SMS sent successfully";
      }

      try {
        const func = clients[clientName];
        const result = await func(number.toString());

        if (result) {
          totalSent++;
          console.log(
            chalk.yellow(
              `📩 [${clientName}] Sent message ${totalSent}/${msgs} to ${number}`
            )
          );
        }

        // add delay between messages
        if (delay > 0) {
          await new Promise((res) => setTimeout(res, delay));
        }
      } catch (err) {
        console.error(
          chalk.red(`❌ Error sending SMS with ${clientName}:`),
          err.message || err
        );
      }
    }
  }

  if (totalSent < msgs) {
    console.warn(
      chalk.red(
        `⚠️ Could not send all messages. Sent ${totalSent}/${msgs} to ${number}`
      )
    );
    return "Partial success";
  }

  return "SMS sent successfully";
}

export default sendSMS;
