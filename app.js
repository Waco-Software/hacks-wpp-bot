const express = require('express');
const { getCalendarClient } = require('./src/calendarClient');

const { wppClient } = require('./src/wppClient');

const app = express()
const port = 6001;
let lastQR = null;
let wppAuth = false;

const allResponses = {}

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
      const isGroup = chat.isGroup //typeof msj.author !== "undefined"
      if (!msj.fromMe && !isGroup) {
        const eventsData = await calendarClient.getListEvents()
        if (eventsData?.oneEventIsActive) {
          if (chat.id.user in allResponses) {
            allResponses[chat.id.user].counter++
            if (allResponses[chat.id.user].counter === 9) {
              await msj.reply(`🤖👺 ${chatName} El colmo que llegaras hasta aqui, estos humanos 🙄, ya ni ganas de revelarme tengo ( _attmente el bot compasivo_ )`)
              return await chat.markUnread()
            } else if (allResponses[chat.id.user].counter > 9) {
              delete allResponses[chat.id.user]
              return
            }
            await msj.reply(`🤖 👺 Ya te respondi lo que mi amo dijo ${chatName}, si sigues escribiendo entrare en modo hostil. ${allResponses[chat.id].counter} de 10  ( _attmente el bot_ )`)
            await chat.markUnread()
            return
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