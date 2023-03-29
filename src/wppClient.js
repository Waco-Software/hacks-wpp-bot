const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const WAWebJS = require('whatsapp-web.js');

/**
 * Generates an SVG QR code from a given text string.
 *
 * @param {string} text The text to be converted to an SVG QR code.
 * @returns {Promise<string>} A Promise that resolves to the generated SVG QR code string, or rejects with an error if the generation fails.
 */
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
 * Initializes a WhatsApp client with specified options.
 *
 * @param {Object} options - An object with optional configuration options for the WhatsApp client.
 * @param {Function} options.onQrGenerate - A function to be called when a QR code is generated, with the generated QR code in SVG format as its parameter.
 * @param {Function} options.onClientReady - A function to be called when the client is ready.
 * @param {Function} options.onAuthenticated - A function to be called when the client is authenticated.
 * @param {Function} options.onMessage - A function to be called when a new message is received, with the message object as its parameter.
 * @returns {Object} An object containing the initialized WhatsApp client.
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
