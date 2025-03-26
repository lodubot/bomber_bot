import * as clients from "../lib/sms.js";

async function sendSMS(number, msgs) {
  let totalSent = 0;

  for (let clientName in clients) {
    let func = clients[clientName];

    if (totalSent >= msgs) {
      return "SMS sent successfully";
    }
    try {
      const result = await func(number.toString());
      if (result) {
        totalSent++;
      }
    } catch (err) {
      console.error(`Error sending SMS with ${clientName}:`, err);
      throw new Error(`Error sending SMS with ${clientName}: ${err}`);
    }
  }

  if (totalSent < msgs) {
    console.log(`Retrying for remaining ${msgs - totalSent} messages...`);
    return await sendSMS(number, msgs - totalSent);
  }

  return "SMS sent successfully";
}

export default sendSMS;