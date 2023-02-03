const express = require('express');
const { getCalendarClient } = require('./src/calendarClient');

const { wppClient } = require('./src/wppClient');

const app = express()
const port = 6001;

app.get('/', (req, res) => {
  const calendarClient = getCalendarClient()
  wppClient({
    onQrGenerate: (svg) => {
      res.send(svg);
    },
    onAuthenticated: () => {
      res.send("auth is true");
      calendarClient.auth()
    },
    onMessage: async (msj) => {
      const chat = await msj.getChat()
      const isGroup = chat.isGroup //typeof msj.author !== "undefined"
      if (!msj.fromMe && !isGroup) {
        const eventsData = await calendarClient.getListEvents()
        if (eventsData?.oneEventIsActive) {
          msj.reply("🤖 Estoy en una reunion ahora mismo, escribeme luego, muchas gracias. (bot)")
          await chat.markUnread()
        }
      }
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})