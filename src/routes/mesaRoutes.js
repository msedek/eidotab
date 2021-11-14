const express = require("express");
const router = express.Router();
const _ = require("underscore");
const printer = require("node-thermal-printer");
const moment = require("moment-timezone");

const Mesa = require("../models/mesa");
const Code = require("../models/code");
const Justy = require("../models/justy");
const Perdida = require("../models/perdida");
const Comanda = require("../models/comanda");
const ComandaCierre = require("../models/comandaCierre");
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
      ip: `tcp://${subRed}.${ip}`, // Ethernet printing IP
      port: 9100 // Ethernet printing PORT
    });
    resolve(thermal);
  });
};

const printToBarraItem = (cambiarMesa, barra, horaEmis) => {
  return new Promise((resolve, reject) => {
    const mesaOrigen = cambiarMesa.mesaOrigen;
    const articulo = cambiarMesa.articulo;
    const mesaDestino = cambiarMesa.mesaDestino;

    barra.alignCenter();
    barra.println(
      `Se cambio ${articulo} de Mesa ${mesaOrigen} a Mesa ${mesaDestino}`
    );
    barra.println(`a las ${horaEmis}`);

    barra.cut();
    barra.execute();
    // console.log(barra.getText());
    barra.clear();

    resolve("ok");
  });
};

const printToBarraItemDelete = (elimItem, barra, horaEmis) => {
  return new Promise((resolve, reject) => {
    const mesaOrigen = elimItem.mesaOrigen;
    const articulo = elimItem.articulo;

    barra.alignCenter();
    barra.println(`Se elimino ${articulo} de Mesa ${mesaOrigen}`);

    barra.println(`a las ${horaEmis}`);

    barra.cut();
    barra.execute();
    // console.log(barra.getText());
    barra.clear();

    resolve("ok");
  });
};

const printToCocinaItemDelete = (elimItem, barra, horaEmis) => {
  return new Promise((resolve, reject) => {
    const mesaOrigen = elimItem.mesaOrigen;
    const articulo = elimItem.articulo;

    barra.alignCenter();
    barra.println(`Se elimino ${articulo} de Mesa ${mesaOrigen}`);

    barra.println(`a las ${horaEmis}`);

    barra.cut();
    barra.execute();
    // console.log(barra.getText());
    barra.clear();

    resolve("ok");
  });
};

const printToCocinaItem = (cambiarMesa, cocina, horaEmis) => {
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

//metodo POST CODE
router.post("/api/createcode", async (req, res) => {
  await Code.findOne({ contact_id: req.body.contact_id }).then(contact => {
    console.log(contact);
    if (contact) {
      contact.code = req.body.code;
      contact.save();
    } else {
      Code.create(req.body);
    }
  });
  res.json("done");
});

//metodo GET
router.get("/api/perdidas", (req, res) => {
  Perdida.getPerdidas((err, perdidas) => {
    if (err) {
      throw err;
    }
    res.json(perdidas);
  });
});

router.get("/api/mesas", (req, res) => {
  Mesa.getMesas((err, mesas) => {
    if (err) {
      throw err;
    }
    res.json(mesas);
  });
});

//metodo GET Mesero
router.get("/api/codes", (req, res) => {
  Code.getCodes((err, codes) => {
    if (err) {
      throw err;
    }
    res.json(codes);
  });
});

router.get("/api/justies", (req, res) => {
  Justy.getJusties((err, justies) => {
    if (err) {
      throw err;
    }
    res.json(justies);
  });
});

router.get("/api/mesasMobile", (req, res) => {
  Mesa.getMesasMobile((err, mesas) => {
    if (err) {
      throw err;
    }
    res.json(mesas);
  });
});

router.get("/api/mesas/:_id", (req, res) => {
  Mesa.getMesaByIdRest(req.params._id, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

router.get("/api/mesastest/:_id", (req, res) => {
  let id = {};

  id.id = req.params._id;

  Mesa.getMesaById(id, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

router.post("/api/codes", (req, res) => {
  const code = req.body;
  Code.addCode(code, (err, code) => {
    if (err) {
      throw err;
    }
    res.json(code);
  });
});

router.post("/api/perdidas", (req, res) => {
  const perdida = req.body;
  Perdida.addPerdida(perdida, (err, perdida) => {
    if (err) {
      throw err;
    }
    res.json(perdida);
  });
});

router.post("/api/justys", (req, res) => {
  const justy = req.body;
  Justy.addJusty(justy, (err, justy) => {
    if (err) {
      throw err;
    }
    res.json(justy);
  });
});

//metodo POST
router.post("/api/mesas", (req, res) => {
  const mesa = req.body;
  Mesa.addMesa(mesa, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

//metodo PUT
router.put("/api/mesas/:_id", (req, res) => {
  const id = req.params._id;
  const mesa = req.body;
  Mesa.updateMesa(id, mesa, {}, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

//metodo PUT
router.put("/api/changemesa/:id", (req, res) => {
  const id = req.params.id;
  const original = req.body.mesaID;
  const io = req.app.get("socketio");

  let data = {
    original: original,
    toChange: id,
    io: io
  };

  Mesa.getMesaByIdChange(data, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

const codeFinder = code => {
  return new Promise((resolve, reject) => {
    Code.findCode(code, (err, code) => {
      if (err) {
        console.log(err);
      }
      if (code.length > 0) {
        resolve(code);
      } else {
        resolve("not found");
      }
    });
  });
};

const reasonFinder = justy => {
  return new Promise((resolve, reject) => {
    Justy.findJusty(justy, (err, justy) => {
      if (err) {
        console.log(err);
      }
      if (justy.length > 0) {
        resolve(justy);
      } else {
        resolve("not found");
      }
    });
  });
};

//metodo PUT
router.put("/api/deleteitem/:id", async (req, res) => {
  const id = req.params.id;
  const itemID = req.body.itemID;
  const merma = req.body.merma;
  const code = req.body.code;
  const justy = req.body.justy;
  const io = req.app.get("socketio");

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  const horaEmis = hour + ":" + minutes;

  const validateCode = await codeFinder(code).catch(err => console.log(err));
  if (validateCode) {
    if (validateCode !== "not found") {
      const validateReason = await reasonFinder(justy).catch(err =>
        console.log(err)
      );

      if (validateReason) {
        let itemFilter;
        let myMesa;
        if (validateReason !== "not found") {
          const deleteMesa = await Mesa.findOne({ _id: id })
            .populate({
              path: "empleados",
              populate: {
                path: "mensajes"
              }
            })
            .then(mesa => {
              let cobrados = [];
              myMesa = _.clone(mesa);
              let item = mesa.orders.find(order => {
                if (order.cobrado === true) cobrados.push(order);
                return order._id.toString().trim() === itemID;
              });

              itemFilter = item;
              let items = _.without(mesa.orders, item);

              for (let i = 0; i < cobrados.length; i++) {
                const order = cobrados[i];
                items = _.without(items, order);
              }

              if (items.length === 0) {
                mesa.estado = mesa.estado === "Master" ? mesa.estado : "Libre";
                mesa.comandas = [];
                mesa.empleados = [];
                mesa.tipoDescuento = "";
                mesa.acumuladoDescuento = 0;
                mesa.orders = [];
                mesa.pax = 0;
              }

              mesa.orders = items;
              mesa.save();
              io.emit("updateMesa", mesa);
            });

          res.json(myMesa);

          let mItem = itemFilter.order.split("-");
          let mItem2 = mItem[2].split("*");
          let myId = mItem2[1];

          let dataItem = {
            merma: merma,
            code: validateCode[0]._id,
            justy: validateReason[0]._id,
            item: myId,
            receta: mItem[0]
          };

          Perdida.addPerdida(dataItem, (err, merma) => {
            if (err) {
              console.log(err);
            }
          });

          let elimItem = {
            mesaOrigen: myMesa.numeroMesa,
            articulo: mItem[0]
          };

          const barra = await configPrinter(printer, IMPRESORA_BAR); //33 COCINA 50 barra
          const printBarra = await printToBarraItemDelete(
            elimItem,
            barra,
            horaEmis
          );
          const cocina = await configPrinter(printer, IMPRESORA_COCINA);
          const printCocina = await printToCocinaItemDelete(
            elimItem,
            cocina,
            horaEmis
          );
        } else {
          res.json({ sms: "Justificaion invalida" });
        }
      } else {
        res.json({ err: "error interno" });
      }
    } else {
      res.json({ sms: "codigo invalido" });
    }
  } else {
    res.json({ err: "error interno" });
  }
});

router.post("/api/checkpass", async (req, res) => {
  const code = req.body.pass;
  const validateCode = await codeFinder(code).catch(err => console.log(err));
  if (validateCode) {
    if (validateCode !== "not found") {
      res.json({ sms: "codigo valido" });
    } else {
      res.json({ sms: "codigo invalido" });
    }
  } else {
    res.json({ err: "error interno" });
  }
});

router.put("/api/changeitem/:id", async (req, res) => {
  const id = req.params.id;
  const original = req.body.mesaID;
  const itemID = req.body.itemID;
  const mesaOrigen = req.body.tableNumber;
  const io = req.app.get("socketio");

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  const horaEmis = hour + ":" + minutes;

  let empleado;
  let pax;

  const updateMesa = await Mesa.findByIdAndUpdate({ _id: original })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .then(mesaOriginal => {
      empleado = mesaOriginal.empleados[0];
      pax = mesaOriginal.pax;
      item = mesaOriginal.orders.find(order => {
        return order._id.toString().trim() === itemID;
      });

      let items = _.without(mesaOriginal.orders, item);

      let canDelete = true;

      items.forEach(element => {
        if (!element.cobrado) canDelete = false;
      });

      if (canDelete) {
        mesaOriginal.estado =
          mesaOriginal.estado === "Master" ? mesaOriginal.estado : "Libre";
        mesaOriginal.empleados = [];
        mesaOriginal.comandas = [];
        mesaOriginal.orders = [];
        mesaOriginal.pax = 0;
      }
      mesaOriginal.orders = items;
      mesaToAnswer = mesaOriginal;
      mesaOriginal.save();
      io.emit("updateMesa", mesaOriginal);
    });

  const newMesa = await Mesa.findByIdAndUpdate({ _id: id }, { new: true })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .then(async mesa => {
      mesa.estado = mesa.estado === "Master" ? mesa.estado : "Ocupada";
      mesa.orders.push(item);
      mesa.empleados.push(empleado);
      mesa.pax = pax;
      mesa.comandas = [];
      mesa.save();
      io.emit("updateMesa", mesa);

      let matrix = mesa.orders[0].order.split("-");
      let articulo = matrix[0];

      let cambiarMesa = {
        mesaOrigen: mesaOrigen,
        articulo: articulo,
        mesaDestino: mesa.numeroMesa
      };

      const barra = await configPrinter(printer, IMPRESORA_BAR); //33 COCINA 50 barra
      const printBarra = await printToBarraItem(cambiarMesa, barra, horaEmis);

      const cocina = await configPrinter(printer, IMPRESORA_COCINA);
      const printCocina = await printToCocinaItem(
        cambiarMesa,
        cocina,
        horaEmis
      );
    });
  res.json(newMesa);
});

router.post("/api/linkmesas/:_id", async (req, res) => {
  const mesas = req.body.data;
  const masterId = req.params._id;
  const io = req.app.get("socketio");

  res.json(mesas);

  let master = mesas.find(mesa => {
    return mesa._id.toString().trim() === masterId;
  });

  let slaves = _.without(mesas, master);

  for (let i = 0; i < slaves.length; i++) {
    const mesa = slaves[i];
    const updateSlaves = await Mesa.findByIdAndUpdate(
      { _id: mesa._id },
      {
        $set: {
          estado: "Slave",
          comandas: [],
          empleados: [],
          master: masterId,
          orders: [],
          pax: 0
        }
      },
      { new: true }
    );
    io.emit("updateMesa", updateSlaves);

    const updateMaster = await Mesa.findByIdAndUpdate(
      { _id: masterId },
      {
        $push: { empleados: mesa.empleados, orders: mesa.orders },
        $set: { estado: "Master", master: masterId, comandas: [] },
        $inc: { pax: mesa.pax }
      },
      { new: true }
    ).populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    });
    io.emit("updateMesa", updateMaster);
  }
});

router.post("/api/unlinkmesas", (req, res) => {
  const mesas = req.body.data;
  const io = req.app.get("socketio");
  let comandas = mesas[0].comandas;

  for (let j = 0; j < comandas.length; j++) {
    const comanda = comandas[j];
    let comandaCierre = {
      enviado: comanda.enviado,
      orders: comanda.orders,
      nro_comanda: comanda.nro_comanda,
      numeroMesa: comanda.numeroMesa,
      estado: comanda.estado,
      fechaorden: comanda.fechaorden,
      mesa: comanda.mesa,
      empleado: comanda.empleado
    };

    ComandaCierre.addComandaCierre(comandaCierre, (err, comandaCierre) => {
      if (err) {
        console.log(err);
      }
      Comanda.deleteComanda(comanda._id, (err, comanda) => {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  for (let i = 0; i < mesas.length; i++) {
    const mesa = mesas[i];
    Mesa.desunirMesa(mesa._id, (err, mesaBack) => {
      if (err) {
        console.log(err);
      }
      io.emit("updateMesa", mesaBack);
    });
  }
  res.json(mesas);
});

//metodo PUT MESAS COMANDA
router.put("/api/mesacomanda/:_id", (req, res) => {
  const id = req.params._id;
  const mesa = req.body;
  Mesa.updateMesaComanda(id, mesa, {}, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

//metodo chargeCuenta
router.put("/api/chargeitem/:_id", (req, res) => {
  const id = req.params._id;
  const item = req.body.itemID;
  Mesa.chargeItem(id, item, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

//metodo DELETE
router.delete("/api/mesas/:_id", (req, res) => {
  const id = req.params._id;
  Mesa.deleteMesa(id, (err, mesa) => {
    if (err) {
      throw err;
    }
    res.json(mesa);
  });
});

router.delete("/api/codes/:_id", (req, res) => {
  const id = req.params._id;
  Code.deleteCode(id, (err, code) => {
    if (err) {
      throw err;
    }
    res.json(code);
  });
});

router.delete("/api/justys/:_id", (req, res) => {
  const id = req.params._id;
  Justy.deleteJusty(id, (err, justy) => {
    if (err) {
      throw err;
    }
    res.json(justy);
  });
});

module.exports = router;
