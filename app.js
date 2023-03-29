const express = require('express');
const { getCalendarClient } = require('./src/calendarClient');

const { wppClient } = require('./src/wppClient');

const app = express()
const port = 6001;
let lastQR = null;
let wppAuth = false;

const allResponses = {}

/**
 * Starts the bot application, initializing the WhatsApp and calendar clients, and setting up event listeners for incoming messages and authentication.
 */
const start = () => {
  const calendarClient = getCalendarClient()

  wppClient({
    onQrGenerate: (svg) => {
      lastQR = svg;
    },
    onAuthenticated: () => {
      wppAuth = true;
      calendarClient.auth()
    },
    onMessage: async (msj) => {
      const chat = await msj.getChat()
      const contact = await chat.getContact()
      const chatName = contact.name.split(" ")[0];
      const isGroup = chat.isGroup;
      if (!msj.fromMe && !isGroup) {
        const eventsData = await calendarClient.getListEvents()
        if (eventsData?.oneEventIsActive) {
          if (chat.id.user in allResponses) {
            // send message if userid is inside allResponses
            // return
          }
          allResponses[chat.id.user] = {
            lastResponse: new Date(),
            counter: 0
          }
          await msj.reply(`🤖 ${chatName} Estoy en una reunion ahora mismo, escribeme luego, muchas gracias. ( _mensaje por bot_ )`)
          await chat.markUnread()
        }
      }
    }
  });
}

app.get('/', (req, res) => {
  if (wppAuth) return res.send("wpp authenticated");
  res.send(lastQR)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  start()
})