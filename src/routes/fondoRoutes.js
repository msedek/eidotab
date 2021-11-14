const express = require("express");
const router = express.Router();

const Fondo = require("../models/fondo");
const Empleado = require("../models/empleado");

const printer = require("node-thermal-printer");
const { join } = require("path");
const _ = require("underscore");

const configs = require("../configs/configs");
const IMPRESORA_CAJA = configs.impresoraCaja;
const subRed = configs.subRed;
const LOGO = configs.logo;

const initPrinter = () => {
  printer.init({
    type: printer.printerTypes.EPSON, // 'star' or 'epson'
    interface: `tcp://${subRed}${IMPRESORA_CAJA}:9100`, // IMPRESORA MOZO 1
    width: 48, // Number of characters in one line (default 48)
    characterSet: "USA", // Character set default SLOVENIA
    removeSpecialCharacters: false, // Removes special characters - default: false
    replaceSpecialCharacters: true, // Replaces special characters listed in config files - default: true
    lineChar: "-",
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
    }, // Use custom character for drawing lines
    ip: `${subRed}${IMPRESORA_CAJA}`, // IMPRESORA MOZO 1
    port: 9100 // Ethernet printing PORT
  });
};

//metodo GET
router.get("/api/fondos", (req, res) => {
  Fondo.getFondos((err, fondos) => {
    if (err) {
      res.status(500);
      res.json({ sms: "No se pudo obtener el fondo" });
    }
    res.json(fondos);
  });
});

//metodo GET
router.get("/api/fondos/:_id", async (req, res) => {
  let fondo = await Fondo.findOne({ _id: req.params._id });
  res.json(fondo);
});

//metodo GET
router.post("/api/paloteo/:_id", async (req, res) => {
  let fondo = await Fondo.findOne({ _id: req.params._id });

  res.json({ sms: "done" });

  let items = [];
  let subTotal = 0;

  for (let i = 0; i < fondo.detalleAuto.length; i++) {
    const detalles = fondo.detalleAuto[i];
    for (let j = 0; j < detalles.orderDetails.length; j++) {
      let orden = detalles.orderDetails[j];
      // let selector = orden.split("-");
      // let order = selector[0];

      // let data = selector[2];
      // let selector2 = data.split("*");
      // myProduct = selector2[1];

      // let precio = parseFloat(selector2[5]) * 1.18;
      // let sku = selector2[0];

      // const cantidad = orden.match(/\(([^)]+)\)/)[1];

      // let splitData = order.split(".");
      // let subSplitData = splitData[0].split("_");
      // let nombreItem = subSplitData[0];

      let nombreItem = orden.nombrePlato;
      let cantidad = orden.cantidad;
      let precio = orden.precio;

      subTotal = subTotal + cantidad * precio;
      items.push([
        { text: nombreItem, align: "LEFT", width: 0.7 },
        { text: cantidad, align: "CENTER", width: 0.15 },
        { text: precio.toFixed(2), width: 0.125, align: "RIGHT" },
        { text: (cantidad * precio).toFixed(2), align: "CENTER", width: 0.25 }
      ]);
    }
  }

  initPrinter();

  printer.alignCenter();
  printer.bold(true);
  const path = join(__dirname, "..", "assets", `${LOGO}.png`);
  printer.printImage(path, done => {
    printer.bold(false);
    printer.newLine();

    printer.alignLeft();
    printer.setTypeFontA();
    printer.drawLine();
    printer.setTypeFontB();

    printer.table([
      "Producto",
      "                       ",
      "Cantidad",
      "Precio",
      "Total"
    ]);

    printer.setTypeFontA();
    printer.drawLine();
    printer.setTypeFontB();

    items.forEach(item => {
      printer.tableCustom(item);
    });

    printer.setTypeFontA();
    printer.drawLine();
    printer.setTypeFontB();
    printer.bold(true);
    printer.println(
      `                                              Total ${subTotal} S/`
    );

    printer.cut();
    // printer.openCashDrawer();
    printer.execute();
    // console.log(printer.getText());
    printer.clear();
  });
});

//metodo POST
router.post("/api/fondos", (req, res) => {
  const fondo = req.body;
  const empleado = req.body.empleado;
  Fondo.addFondo(fondo, (err, fondoNew) => {
    if (err) {
      throw err;
    }
    res.json(fondoNew);

    // console.log(fondoNew._id);
    // console.log(empleado);

    Empleado.findOneAndUpdate(
      { _id: empleado.toString().trim() },
      { $set: { fondoId: fondoNew._id.toString().trim() } }
    ).then(empleado => empleado.save());
  });
});

router.put("/api/fondos/:_id", (req, res) => {
  const id = req.params._id;
  const fondo = req.body;

  Fondo.findOneAndUpdate({ _id: id }, fondo, { new: true }, (err, fondo) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.json({ sms: "Error al crear el cierre" });
    }
    res.json(fondo);
  });
});

router.put("/api/fondobaja/:_id", (req, res) => {
  const id = req.params._id;
  const docId = req.body.docId;

  Fondo.findOne({ _id: id }).then(fondo => {
    let position = 0;
    for (let i = 0; i < fondo.documentos.length; i++) {
      const documento = fondo.documentos[i];
      if (
        documento.documento._id.toString().trim() === docId.toString().trim()
      ) {
        position = i;
        break;
      }
    }

    fondo.documentos.splice(position, 1);
    fondo.detalleAuto.splice(position, 1);
    res.json(fondo);
    fondo.save();
  });
});

//metodo DELETE
router.delete("/api/fondos/:_id", (req, res) => {
  const id = req.params._id;
  Fondo.deleteFondo(id, (err, fondo) => {
    if (err) {
      throw err;
    }
    res.json(fondo);
  });
});

module.exports = router;
