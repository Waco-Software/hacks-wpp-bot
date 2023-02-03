const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const WAWebJS = require('whatsapp-web.js');

const textToQrCodeSvg = (text) => {
  return new Promise((resolve, reject) => {
    QRCode.toString(text, {
      errorCorrectionLevel: 'H',
      type: 'svg',
      width: 400
    }, (err, data) => {
      if (err) {
        return reject(err)
      };
      // console.log(data);
      resolve(data);
    });
  })
}

/**
 * 
 * @param {{
 * onAuthenticated?:()=>void,
 * onClientReady?:()=>void,
 * onQrGenerate?:()=>void,
 * onMessage?:(msj:WAWebJS.Message)=>void
 * }} options 
 * @returns 
 */
const wppClient = (options = {}) => {
  const {
    onQrGenerate = () => null,
    onClientReady = () => null,
    onAuthenticated = () => null,
    onMessage = (msj) => null
  } = options;

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox'],
    }
  });
  let qrSend = false;
  client.on('qr', (qr) => {
    textToQrCodeSvg(qr).then(svg => {
      if (qrSend) {
        return client.destroy()
      }
      onQrGenerate(svg)
      qrSend = true;
    })
  });

  client.on('ready', () => {
    console.log('Client is ready!');
    onClientReady()
  });

  client.on('message', msg => {
    onMessage(msg);
  });
  client.on("authenticated", () => {
    console.log("wpp auth")
    onAuthenticated()
  })
  client.on("auth_failure", (msj) => {
    console.log(msj)
  })
  client.initialize();
  return {
    client: client
  }
}

exports.wppClient = wppClient;
