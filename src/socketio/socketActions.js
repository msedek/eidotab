// const SEND_MENSAJE = "getMensajeById";
const SEND_MESA = "sendMesa";
const SEND_MESA_DATA = "getMesaById";
const UPDATE_MESA = "updateMesa";
const GET_MESAS = "getMesas";
const CLOSE_SHIFT = "closeShift";
const PARTIAL_LOG = "partialLog";
const PRE_CUENTA = "preCuenta";
const PRE_CUENTA2 = "preCuenta2";

const printer = require("node-thermal-printer");
const { join } = require("path");
const _ = require("underscore");
const Mesa = require("../../src/models/mesa");
const Comanda = require("../../src/models/comanda");
const Mensaje = require("../../src/models/mensaje");
const Empleado = require("../../src/models/empleado");
const Receta = require("../../src/models/receta");
const moment = require("moment-timezone");

const configs = require("../configs/configs");

const IMPRESORA_CAJA = configs.impresoraCaja;
const IMPRESORA_MOZO1 = configs.impresoraMozo1;
const IMPRESORA_MOZO2 = configs.impresoraMozo2;
const URL_DAEMON = configs.urlDaemon;
const subRed = configs.subRed;
const controlZoho = configs.controlZoho;
const LOGO = configs.logo;
const RAZON_SOCIAL = configs.razon;
const RUC = configs.ruc;
const DIRECCION = configs.direccion;
const TELEFONO = configs.telefono;
const TAX = configs.impRc;

module.exports = io => {
  io.on("connection", socket => {
    // console.log("User Connected");
    //GET MESAS (CAJA, ADMINISTRADOR, MESERO)
    socket.on(SEND_MESA, () => {
      Mesa.getMesas((err, mesas) => {
        if (err) {
          throw err;
        }
        socket.emit(GET_MESAS, JSON.stringify(mesas));
      });
    });

    //GET ORDERBYID (CAJA, ADMINISTRADOR, MESERO)
    socket.on(SEND_MESA_DATA, id => {
      Mesa.getMesaById(id, (err, mesa) => {
        if (err) {
          throw err;
        }
        socket.emit(SEND_MESA_DATA, JSON.stringify(mesa));
      });
    });

    const initPrinter1 = () => {
      printer.init({
        type: printer.printerTypes.EPSON, // 'star' or 'epson'
        interface: `tcp://${subRed}${IMPRESORA_MOZO1}:9100`, // IMPRESORA MOZO 1
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
        ip: `${subRed}${IMPRESORA_MOZO1}`, // IMPRESORA MOZO 1
        port: 9100 // Ethernet printing PORT
      });
    };

    const initPrinter2 = () => {
      printer.init({
        type: printer.printerTypes.EPSON, // 'star' or 'epson'
        interface: `tcp://${subRed}${IMPRESORA_MOZO2}:9100`, // IMPRESORA MOZO 1
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
        ip: `${subRed}${IMPRESORA_MOZO2}`, // IMPRESORA MOZO 1
        port: 9100 // Ethernet printing PORT
      });
    };

    socket.on(PRE_CUENTA, id => {
      Mesa.findOne({ _id: id })
        .populate({
          path: "empleados",
          populate: {
            path: "mensajes"
          }
        })
        .then(mesa => {
          mesa.estado = mesa.estado !== "Master" ? "Por Cobrar" : mesa.estado;
          mesa.save();

          let hour = moment.tz("America/Lima").hours();
          let minutes = moment.tz("America/Lima").minutes();
          if (minutes < 10) {
            minutes = "0" + minutes;
          }

          let horaEmis = hour + ":" + minutes;

          let items = [];
          let subTotal = 0;

          for (let i = 0; i < mesa.orders.length; i++) {
            let orden = mesa.orders[i].order;

            let selector = orden.split("-");
            let order = selector[0];

            let data = selector[2];
            let selector2 = data.split("*");
            myProduct = selector2[1];

            let precio = parseFloat(selector2[5]) * 1.18;
            let sku = selector2[0];

            const cantidad = orden.match(/\(([^)]+)\)/)[1];

            let splitData = order.split(".");
            let subSplitData = splitData[0].split("_");
            let nombreItem = subSplitData[0];
            subTotal = subTotal + precio;

            items.push([
              { text: cantidad, align: "CENTER", width: 0.1 },
              { text: `${sku}`, align: "CENTER", width: 0.25 },
              { text: nombreItem, align: "LEFT", width: 0.8 },
              { text: precio.toFixed(2), width: 0.125, align: "RIGHT" }
            ]);
          }

          initPrinter1();

          printer.alignCenter();
          printer.bold(true);
          const path = join(__dirname, "..", "assets", `${LOGO}.png`);
          printer.printImage(path, done => {
            printer.bold(false);
            printer.newLine();
            printer.setTypeFontB();

            printer.println(`${DIRECCION} - ${TELEFONO}`);
            printer.bold(true);
            printer.println(`PRECUENTA MESA ${mesa.numeroMesa}`);
            printer.bold(true);
            printer.println(" Hora Emis.: " + horaEmis);
            printer.bold(false);
            printer.alignLeft();
            printer.newLine();

            printer.alignLeft();
            printer.setTypeFontA();
            printer.drawLine();
            printer.setTypeFontB();

            printer.table([
              "Cant.",
              "Cod.",
              "Descripcion",
              "                       ",
              "Importe"
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

            printer.println(
              "                 SUB-TOTAL S/:                           " +
                (subTotal).toFixed(2)
            );

            printer.bold(true);
            printer.println(
              "                 IMPORTE TOTAL S/:                       " +
                (subTotal).toFixed(2)
            );

            printer.bold(false);
            printer.newLine();

            printer.println(
              `Razon social:___________________________________________________`
            );
            printer.newLine();
            printer.println(
              `            :___________________________________________________`
            );
            printer.newLine();
            printer.println(
              `Ruc         :___________________________________________________`
            );
            printer.newLine();
            printer.println(
              `Correo      :___________________________________________________`
            );
            printer.newLine();

            printer.println(
              `Este documento no es un comprobante de pago, es un estado de cuenta.`
            );

            printer.cut();
            // printer.openCashDrawer();
            printer.execute();
            // console.log(printer.getText());
            printer.clear();
          });

          io.emit("updateMesa", mesa);
        });
    });

    socket.on(PRE_CUENTA2, id => {
      Mesa.findOne({ _id: id })
        .populate({
          path: "empleados",
          populate: {
            path: "mensajes"
          }
        })
        .then(mesa => {
          mesa.estado = mesa.estado !== "Master" ? "Por Cobrar" : mesa.estado;
          mesa.save();

          let hour = moment.tz("America/Lima").hours();
          let minutes = moment.tz("America/Lima").minutes();
          if (minutes < 10) {
            minutes = "0" + minutes;
          }

          let horaEmis = hour + ":" + minutes;

          let items = [];
          let subTotal = 0;

          for (let i = 0; i < mesa.orders.length; i++) {
            let orden = mesa.orders[i].order;

            let selector = orden.split("-");
            let order = selector[0];

            let data = selector[2];
            let selector2 = data.split("*");
            myProduct = selector2[1];

            let precio = parseFloat(selector2[5]) * 1.18;
            let sku = selector2[0];

            const cantidad = orden.match(/\(([^)]+)\)/)[1];

            let splitData = order.split(".");
            let subSplitData = splitData[0].split("_");
            let nombreItem = subSplitData[0];
            subTotal = subTotal + precio;

            items.push([
              { text: cantidad, align: "CENTER", width: 0.1 },
              { text: `${sku}`, align: "CENTER", width: 0.25 },
              { text: nombreItem, align: "LEFT", width: 0.8 },
              { text: precio.toFixed(2), width: 0.125, align: "RIGHT" }
            ]);
          }

          initPrinter2();

          printer.alignCenter();
          printer.bold(true);
          const path = join(__dirname, "..", "assets", `${LOGO}.png`);
          printer.printImage(path, done => {
            printer.bold(false);
            printer.newLine();
            printer.setTypeFontB();

            printer.println(`${DIRECCION} - ${TELEFONO}`);
            printer.bold(true);
            printer.println(`PRECUENTA MESA ${mesa.numeroMesa}`);
            printer.bold(true);
            printer.println(" Hora Emis.: " + horaEmis);
            printer.bold(false);
            printer.alignLeft();
            printer.newLine();

            printer.alignLeft();
            printer.setTypeFontA();
            printer.drawLine();
            printer.setTypeFontB();

            printer.table([
              "Cant.",
              "Cod.",
              "Descripcion",
              "                       ",
              "Importe"
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

            printer.println(
              "                 SUB-TOTAL S/:                           " +
                (subTotal).toFixed(2)
            );

            printer.bold(true);
            printer.println(
              "                 IMPORTE TOTAL S/:                       " +
                (subTotal).toFixed(2)
            );

            printer.bold(false);
            printer.newLine();

            printer.println(
              `Razon social:___________________________________________________`
            );
            printer.newLine();
            printer.println(
              `            :___________________________________________________`
            );
            printer.newLine();
            printer.println(
              `Ruc         :___________________________________________________`
            );
            printer.newLine();
            printer.println(
              `Correo      :___________________________________________________`
            );
            printer.newLine();

            printer.println(
              `Este documento no es un comprobante de pago, es un estado de cuenta.`
            );

            printer.cut();
            // printer.openCashDrawer();
            printer.execute();
            // console.log(printer.getText());
            printer.clear();
          });

          io.emit("updateMesa", mesa);
        });
    });

    //GET MESSAGESBYID (MESERO)
    // socket.on(SEND_MENSAJE, id => {
    //   Mensaje.getMensajeByIdSocket(id, (err, mensajes) => {
    //     if (err) {
    //       throw err;
    //     }
    //     socket.emit(SEND_MENSAJE, JSON.stringify(mensajes));
    //   });
    // });

    //UPDATE MESA BY ID (MESERO/CAJA)
    socket.on(UPDATE_MESA, id => {
      Mesa.getMesaById(id, (err, mesa) => {
        if (err) {
          throw err;
        }
        socket.emit(UPDATE_MESA, JSON.stringify(mesa));
      });
    });
    //PARTIAL CLOSE MOZO
    socket.on(PARTIAL_LOG, id => {
      Empleado.findOneAndUpdate({ _id: id }, { $set: { fondoId: "" } }).exec();
    });
    //CLOSE SHIFT(MESERO)
    socket.on(CLOSE_SHIFT, () => {
      socket.emit(CLOSE_SHIFT, JSON.stringify({ sms: "close" }));
    });
    ////////////////////////////////////
    socket.on("disconnect", () => {
      // console.log("User Disconnected");
    });
  });
};
