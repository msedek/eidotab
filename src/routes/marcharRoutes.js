const express = require("express");
const router = express.Router();
const printer = require("node-thermal-printer");
const moment = require("moment-timezone");

const configs = require("../configs/configs");

const impresoraCocina = configs.impresoraCaja;
const subRed = configs.subRed;


//metodo POST
router.post("/api/marchar", (req, res) => {
  const marchar = req.body;
  res.json(marchar);

  const mesa = marchar.mesa;
  const command = marchar.command;

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  const horaEmis = hour + ":" + minutes;

  printer.init({
    type: printer.printerTypes.EPSON, // 'star' or 'epson'
    interface: `tcp://${subRed}${impresoraCocina}:9100`, // Linux interface
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
    ip: `${subRed}${impresoraCocina}`, // Ethernet printing IP
    port: 9100 // Ethernet printing PORT
  });

  printer.alignCenter();
  printer.println(command + " MESA " + mesa);
  printer.println(command + " HORA " + horaEmis);

  printer.cut();
  printer.execute();
});

module.exports = router;
