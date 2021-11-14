const express = require("express");
const router = express.Router();
const printer = require("node-thermal-printer");
const moment = require("moment-timezone");
const configs = require("../configs/configs");

const IMPRESORA_COCINA = configs.impresoraCocina;
const IMPRESORA_BAR = configs.impresoraBar;
const subRed = configs.subRed;

const configPrinter = (thermal, ip) => {
  return new Promise((resolve, reject) => {
    thermal.init({
      type: thermal.printerTypes.EPSON, // 'star' or 'epson'
      interface: `tcp://${subRed}${ip}:9100`, // Linux interface 33 es cocina 50 barra 49 caja
      width: 40, // Number of characters in one line (default 48)
      characterSet: "USA", // Character set default SLOVENIA
      removeSpecialCharacters: false, // Removes special characters - default: false
      replaceSpecialCharacters: true, // Replaces special characters listed in config files - default: true
      // lineChar: "=",                  // Use custom character for drawing lines
      extraSpecialCharacters: {
        "@": 64,
        ñ: 164,
        Ñ: 165,
        á: 160,
        Á: 181,
        é: 130,
        É: 144,
        í: 161,
        Í: 214,
        ó: 162,
        Ó: 224,
        ú: 163,
        Ú: 233
      },
      ip: `tcp://${subRed}${ip}`, // Ethernet printing IP
      port: 9100 // Ethernet printing PORT
    });
    resolve(thermal);
  });
};

const printToBarra = (cambiarMesa, barra, horaEmis) => {
  return new Promise((resolve, reject) => {
    const mesaOrigen = cambiarMesa.mesaOrigen;
    const command = cambiarMesa.command;
    const mesaDestino = cambiarMesa.mesaDestino;

    barra.alignCenter();
    barra.println(`Mesa ${mesaOrigen} ${command} Mesa ${mesaDestino}`);
    barra.println(`a las ${horaEmis}`);

    barra.cut();
    barra.execute();
    barra.clear();

    resolve("ok");
  });
};

const printToCocina = (cambiarMesa, cocina, horaEmis) => {
  return new Promise((resolve, reject) => {
    const mesaOrigen = cambiarMesa.mesaOrigen;
    const command = cambiarMesa.command;
    const mesaDestino = cambiarMesa.mesaDestino;

    cocina.alignCenter();
    cocina.println(`Mesa ${mesaOrigen} ${command} Mesa ${mesaDestino}`);
    cocina.println(`a las ${horaEmis}`);

    cocina.cut();
    cocina.execute();
    cocina.clear();

    resolve("ok");
  });
};

//metodo POST
router.post("/api/cambiarmesa", async (req, res) => {
  const cambiarMesa = req.body;
  res.json(cambiarMesa);

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  const horaEmis = hour + ":" + minutes;

  const barra = await configPrinter(printer, IMPRESORA_BAR);
  const printBarra = await printToBarra(cambiarMesa, barra, horaEmis);

  const cocina = await configPrinter(printer, IMPRESORA_COCINA);
  const printCocina = await printToCocina(cambiarMesa, cocina, horaEmis);
});

module.exports = router;
