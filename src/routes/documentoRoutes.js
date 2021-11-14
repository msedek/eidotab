const { join } = require("path");
const express = require("express");
const router = express.Router();
const printer = require("node-thermal-printer");
const writtenNumber = require("written-number");
const moment = require("moment-timezone");
const request = require("request");
const _ = require("underscore");
const lo = require("lodash");

const Cliente = require("../models/cliente");
const Documento = require("../models/documento");
const Fondo = require("../models/fondo");
const Mesa = require("../models/mesa");
const Reenvio = require("../models/reenvio");

const configs = require("../configs/configs");

const IMPRESORA_CAJA = configs.impresoraCaja;
// const IMPRESORA_MOZO1 = configs.impresoraMozo1;
// const IMPRESORA_MOZO2 = configs.impresoraMozo2;
const URL_DAEMON = configs.urlDaemon;
const subRed = configs.subRed;
const controlZoho = configs.controlZoho;
const LOGO = configs.logo;
const RAZON_SOCIAL = configs.razon;
const RUC = configs.ruc;
const DIRECCION = configs.direccion;
const TELEFONO = configs.telefono;
const TAX = configs.impRc;

let tax = TAX ? 1.28 : 1.18;

const deletePayment = id => {
  const voidUrl = `https://books.zoho.com/api/v3/customerpayments/${id}?organization_id=640669816&authtoken=0385bb29884bb66db48e582ba63317f7`;
  return new Promise((resolve, reject) => {
    request.delete({ url: voidUrl }, (err, httpResponse, body) => {
      let resp = JSON.parse(body);
      resolve(resp);
    });
  });
};

const voidFactura = (id, paymentId) => {
  const voidUrl = `https://books.zoho.com/api/v3/invoices/${id}/status/void?organization_id=640669816&authtoken=0385bb29884bb66db48e582ba63317f7`;
  return new Promise((resolve, reject) => {
    request.post({ url: voidUrl }, async (err, httpResponse, body) => {
      let resp = JSON.parse(body);
      if (resp.code === 4001) {
        //anular pago
        // console.log(resp.code);
        await deletePayment(paymentId).catch(err => console.log(err));
        voidFactura(id);
      }
      resolve("done");
    });
  });
};

//metodo GET
router.get("/api/documentos", (req, res) => {
  Documento.getDocumentos((err, documentos) => {
    if (err) {
      throw err;
    }
    res.json(documentos);
  });
});

router.get("/api/documentos/:_id", (req, res) => {
  Documento.getDocumentoById(req.params._id, async (err, documento) => {
    if (err) {
      throw err;
    }
    res.json(documento);
    await voidFactura(documento.zohoID, documento.zohoPayment);
  });
});

router.post("/api/client", async (req, res) => {
  const arrived = req.body;

  const client = await Cliente.find({
    cf_ruc_cliente: arrived.numDocReceptor
  });

  let preClient = lo.cloneDeep(client);
  // const cleanClient = preClient.pop();

  // else {
  //   console.log("119 documentRoutes", "ERROR DE CREACION DE CLIENTE EN ZOHO");
  //   res.json({ sms: "ERROR DE CREACION DE CLIENTE EN ZOHO" });
  // }

  if (client.length === 0) {
    // if (_.isEmpty(cleanClient)) {
    let jsonString = JSON.stringify({
      contact_name: arrived.nombreReceptor,
      custom_fields: [
        {
          customfield_id: "527797000010390079",
          is_active: true,
          show_in_all_pdf: false,
          value_formatted: arrived.numDocReceptor,
          data_type: "number",
          index: 1,
          label: "RUC CLIENTE",
          show_on_pdf: false,
          value: arrived.numDocReceptor
        }
      ],
      billing_address: {
        attention: "",
        address: arrived.direccionDestino,
        street2: "",
        state_code: "LIM",
        city: "Lima",
        state: "Lima",
        zip: 0,
        country: "",
        fax: "",
        phone: ""
      }
    });

    let clientZoho = await createContact(jsonString);
    res.json({ clientId: clientZoho.contact.contact_id });
    Cliente.create({
      contact_name: arrived.nombreReceptor,
      cf_ruc_cliente: arrived.numDocReceptor,
      cf_direccion_cliente: arrived.direccionDestino,
      contact_id: clientZoho.contact.contact_id
    });
    // }
  } else {
    const cleanClient = preClient.pop();
    res.json({ clientId: cleanClient.contact_id });
  }
});

const createContact = contact => {
  const contactUrl =
    "https://books.zoho.com/api/v3/contacts?organization_id=640669816&authtoken=0385bb29884bb66db48e582ba63317f7";
  return new Promise((resolve, reject) => {
    request.post(
      { url: contactUrl, form: { JSONString: contact } },
      (err, httpResponse, body) => {
        resolve(JSON.parse(body));
      }
    );
  });
};

const createFactura = valueOne => {
  const stepOne =
    "https://books.zoho.com/api/v3/invoices?organization_id=640669816&authtoken=0385bb29884bb66db48e582ba63317f7";
  return new Promise((resolve, reject) => {
    request.post(
      { url: stepOne, form: { JSONString: valueOne } },
      (err, httpResponse, body) => {
        resolve(JSON.parse(body));
      }
    );
  });
};

const authFactura = inv_id => {
  const stepTwo = `https://books.zoho.com/api/v3/invoices/${inv_id}/approve?organization_id=640669816&authtoken=0385bb29884bb66db48e582ba63317f7`;
  return new Promise((resolve, reject) => {
    request.post({ url: stepTwo }, (err, httpResponse, body) => {
      resolve(JSON.parse(body));
    });
  });
};

const chargeFactura = valueThree => {
  const stepThree =
    "https://books.zoho.com/api/v3/customerpayments?organization_id=640669816&authtoken=0385bb29884bb66db48e582ba63317f7";
  return new Promise((resolve, reject) => {
    request.post(
      { url: stepThree, form: { JSONString: valueThree } },
      (err, httpResponse, body) => {
        resolve(JSON.parse(body));
      }
    );
  });
};

const sendInvoiceToZoho = async documento => {
  let myInvoice = "";
  const dataPago = documento.dataPago;
  const items = [];

  documento.detalle.forEach(item => {
    items.push({
      item_id: item.codItem,
      discount_amount: _.isUndefined(item.descuentoMonto)
        ? "0.00"
        : item.descuentoMonto,
      discount: _.isUndefined(item.descuentoMonto)
        ? "0.00"
        : item.descuentoMonto
    });
  });


  console.log(documento);

  costumer_id =
    documento.clientZoho === "general"
      ? "527797000000391739"
      : documento.clientZoho;

  const valueOne = JSON.stringify({
    customer_id: costumer_id,
    invoice_number: `${documento.documento.serie}-${
      documento.documento.correlativo
    }`,
    line_items: items,
    discount: _.isUndefined(documento.descuento)
      ? "0.00"
      : documento.descuento.mntTotalDescuentos,
    is_discount_before_tax: true,
    discount_type: "item_level"
  });

  const inv_id = await createFactura(valueOne).catch(err => console.log(err));
  // console.log(inv_id); ENVIOS A ZOHO
  if (inv_id.invoice) {
    myInvoice = inv_id.invoice.invoice_id;
    const aprove = await authFactura(myInvoice).catch(err => console.log(err));
    if (aprove) {
      if (aprove.code === 0) {
        for (let i = 0; i < dataPago.length; i++) {
          let pago = dataPago[i];
          let account = "";
          switch (pago.tipoPago) {
            case "EFECTIVO":
              account = "527797000012264081";
              break;
            case "POS MASTERCARD":
              account = "527797000005765813";
              break;
            case "POS VISA":
              account = "527797000005765811";
              break;
            case "DESCUENTO POR PLANILLA":
              account = "527797000003319401";
              break;
            case "CANJE":
              account = "527797000006785021";
              break;
          }

          const tipoPago = pago.tipoPago;
          const referencia =
            pago.tipoPago !== "EFECTIVO"
              ? pago.reference
              : `${documento.documento.serie}-${
                  documento.documento.correlativo
                }${0}`;
          const monto = pago.monto;
          const valueThree = JSON.stringify({
            // customer_id: documento.numDocReceptor,
            customer_id: documento.clientZoho,
            invoice_number: `${documento.documento.serie}-${
              documento.documento.correlativo
            }`,
            payment_mode: tipoPago,
            reference_number: referencia,
            amount: monto,
            date: documento.fechaEmision,
            invoices: [
              {
                invoice_id: myInvoice,
                amount_applied: monto
              }
            ],
            account_id: account
          });

          let payment = await chargeFactura(valueThree).catch(err =>
            console.log(err)
          );

          let myPayment = "";
          if (payment.payment) {
            myPayment = payment.payment.payment_id;
          }

          await Documento.findOneAndUpdate(
            { _id: documento.docID },
            {
              $set: {
                zohoID: inv_id.invoice.invoice_id,
                zohoPayment: myPayment
              }
            }
          ).exec();
        }
      }
    }
  }
};

const awakeDaemon = () => {
  return new Promise((resolve, reject) => {
    request.post(URL_DAEMON, (err, response, body) => {
      resolve("done");
    });
  });
};

const initPrinter = () => {
  printer.init({
    type: printer.printerTypes.EPSON, // 'star' or 'epson'
    interface: `tcp://${subRed}${IMPRESORA_CAJA}:9100`, // Linux interface 49 ES CAJA EN YACHO
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
    ip: `${subRed}${IMPRESORA_CAJA}`, // Ethernet printing IP
    port: 9100 // Ethernet printing PORT
  });
};

// const initPrinter1 = () => {
//   printer.init({
//     type: printer.printerTypes.EPSON, // 'star' or 'epson'
//     interface: `tcp://${subRed}${IMPRESORA_MOZO1}:9100`, // Linux interface 49 ES CAJA EN YACHO
//     width: 48, // Number of characters in one line (default 48)
//     characterSet: "USA", // Character set default SLOVENIA
//     removeSpecialCharacters: false, // Removes special characters - default: false
//     replaceSpecialCharacters: true, // Replaces special characters listed in config files - default: true
//     lineChar: "-",
//     extraSpecialCharacters: {
//       "@": 64,
//       ñ: 164,
//       Ñ: 165,
//       á: 160,
//       Á: 181,
//       é: 130,
//       É: 144,
//       í: 161,
//       Í: 214,
//       ó: 162,
//       Ó: 224,
//       ú: 163,
//       Ú: 233
//     }, // Use custom character for drawing lines
//     ip: `${subRed}${IMPRESORA_CAJA}`, // Ethernet printing IP
//     port: 9100 // Ethernet printing PORT
//   });
// };

// const initPrinter2 = () => {
//   printer.init({
//     type: printer.printerTypes.EPSON, // 'star' or 'epson'
//     interface: `tcp://${subRed}${IMPRESORA_MOZO2}:9100`, // Linux interface 49 ES CAJA EN YACHO
//     width: 48, // Number of characters in one line (default 48)
//     characterSet: "USA", // Character set default SLOVENIA
//     removeSpecialCharacters: false, // Removes special characters - default: false
//     replaceSpecialCharacters: true, // Replaces special characters listed in config files - default: true
//     lineChar: "-",
//     extraSpecialCharacters: {
//       "@": 64,
//       ñ: 164,
//       Ñ: 165,
//       á: 160,
//       Á: 181,
//       é: 130,
//       É: 144,
//       í: 161,
//       Í: 214,
//       ó: 162,
//       Ó: 224,
//       ú: 163,
//       Ú: 233
//     }, // Use custom character for drawing lines
//     ip: `${subRed}${IMPRESORA_CAJA}`, // Ethernet printing IP
//     port: 9100 // Ethernet printing PORT
//   });
// };

router.post("/api/documentos", async (req, res) => {
  const documentorec = req.body;
  const dataPago = documentorec.dataPago;
  const fondoId = documentorec.fondoId;
  const empleado = documentorec.empleado;
  const ticketImpreso = documentorec.ticketImpreso;
  const goZoho = documentorec.goZoho;
  const clientZoho = documentorec.clientZoho;
  const opGratuita = documentorec.opGratuita;
  const opInafecto = documentorec.opInafecto;
  const opConsumo = documentorec.opConsumo;

  let referencia = "";

  for (let i = 0; i < dataPago.length; i++) {
    const pago = dataPago[i];
    if (i === 0) {
      pago.reference === ""
        ? (referencia = referencia + "Efectivo")
        : (referencia = referencia + `${pago.reference}`);
    } else {
      pago.reference === ""
        ? (referencia = referencia + " ,Efectivo")
        : (referencia = referencia + `, ${pago.reference}`);
    }
  }

  let docID = "";
  const documento = await Documento.create(documentorec)
    .then(docum => {
      docID = docum._id;
      return { ...docum._doc };
    })
    .catch(err => console.log(err));

  if (documento) res.json(documento);

  let documentToSave = {};

  documentToSave.documento = documento;
  documentToSave.dataPago = documentorec.dataPago;
  documentToSave.empleado = documentorec.empleado;
  documentToSave.ticketImpreso = documentorec.ticketImpreso;

  await Fondo.findOneAndUpdate(
    { _id: fondoId },
    { $push: { detalleAuto: dataPago, documentos: documentToSave } }
  ).exec();

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  let correlativo = `${documento.documento.serie}-${
    documento.documento.correlativo
  }`;

  let fechaEmis = documento.fechaEmision;
  let horaEmis = hour + ":" + minutes;
  let cliente = documento.documento.nombreReceptor;
  let clienteRuc = documento.documento.numDocReceptor;
  let direccion = documento.documento.direccionDestino;
  let tipoDoc;

  if (documento.tipoDocumento === "01") {
    tipoDoc = "FACTURA";
  } else {
    tipoDoc = "BOLETA";
  }
  writtenNumber.defaults.lang = "es";

  const cant = documento.documento.mntTotal.toFixed(2).split(".");
  const entero = cant[0];
  let decim = "";
  if (cant.length > 1) {
    decim = cant[1];
  }

  const writtenEnt = writtenNumber(entero); // => 'mil doscientos treinta y cuatro'
  const writtenDec = writtenNumber(decim); // => 'mil doscientos treinta y cuatro'

  const fullTotal =
    writtenEnt.toUpperCase() +
    " " +
    "Y" +
    " " +
    writtenDec.toUpperCase() +
    "/100";

  let items = [];

  for (let i = 0; i < ticketImpreso.length; i++) {
    item = ticketImpreso[i];
    items.push([
      { text: item.cantidadItem, align: "CENTER", width: 0.1 },
      { text: `${item.sku}`, align: "CENTER", width: 0.25 },
      { text: item.nombreItem, align: "LEFT", width: 0.8 },
      { text: item.precioItemSinIgv.toFixed(2), width: 0.125, align: "RIGHT" }
    ]);
  }

  initPrinter();

  let logo = "";

  printer.alignCenter();
  printer.bold(true);
  const path = join(__dirname, "..", "assets", `${LOGO}.png`);
  const path2 = join(__dirname, "..", "assets", "facturactiva.png");
  printer.printImage(path, done => {
    printer.bold(false);
    printer.newLine();
    printer.setTypeFontB();

    //1
    printer.bold(true);
    printer.println(`RAZON SOCIAL: ${RAZON_SOCIAL}`);

    //2
    printer.bold(false);
    printer.println(`RUC: ${RUC} Nro.: ${correlativo}`);

    //3
    printer.println(DIRECCION);

    //4
    printer.bold(true);
    printer.println(`${tipoDoc} ELECTRONICA`);

    //5
    printer.bold(true);
    printer.println(`Fecha Emis.: ${fechaEmis} Hora Emis.: ${horaEmis}`);

    //6
    printer.bold(false);
    printer.println(TELEFONO);

    printer.alignLeft();
    printer.newLine();

    printer.println(`SENOR(ES).: ${cliente}`);
    printer.println(`R.U.C.:     ${clienteRuc}`);
    printer.println(`DIRECCION:  ${direccion}`);

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

    let subTotal = 0;
    let recargo = "0.00";

    if (documento.impuesto.length > 1)
      recargo = documento.impuesto[1].montoImpuesto.toFixed(2);

    if (_.isUndefined(documento.descuento)) {
      subTotal = documento.documento.mntNeto;
    } else {
      subTotal = (
        parseFloat(documento.documento.mntNeto) +
        parseFloat(documento.descuento.mntTotalDescuentos)
      ).toFixed(2);
    }

    let recargoConsumo = "0.00";
    let gratuita = "0.00";

    if (documento.impuesto.length > 1)
      recargoConsumo = documento.impuesto[1].montoImpuesto.toFixed(2);

    if (opGratuita) gratuita = subTotal;

    printer.println(
      "                 SUB-TOTAL S/:                           " + subTotal
    );
    printer.println(
      _.isUndefined(documento.descuento)
        ? `                 DSCTO S/:                               0.00`
        : `                 DSCTO S/:                              ${
            documento.descuento.mntTotalDescuentos === 0 ? " " : "-"
          }${documento.descuento.mntTotalDescuentos.toFixed(2)}`
    );
    printer.println(
      "                 OP. GRAVADA S/:                         " +
        documento.documento.mntNeto.toFixed(2)
    );
    printer.println(
      "                 OP INAFECTA S/:                         " + "0.00"
    );
    printer.println(
      "                 OP EXONERATA S/:                        " + "0.00"
    );
    printer.println(
      "                 OP GRATUITA S/:                         " + gratuita
    );
    printer.println(
      "                 RECARGO CONSUMO 10% S/:                 " + recargo
    );
    printer.println(
      "                 TOTAL IGV 18% S/:                       " +
        documento.impuesto[0].montoImpuesto.toFixed(2)
    );
    printer.bold(true);
    printer.println(
      "                 IMPORTE TOTAL S/:                       " +
        documento.documento.mntTotal.toFixed(2)
    );

    printer.bold(false);
    printer.newLine();

    printer.println(`SON: ${fullTotal} Soles`);
    printer.println(`CAJERO: ${empleado}`);
    printer.println(`REFERENCIA: ${referencia}`);

    printer.newLine();
    printer.alignCenter();

    printer.println("Autorizado mediante");
    printer.println("Resolucion de intendencia - N 034-005-0005294/SUNAT");
    printer.println("Representacion impresa del Comprobante electronico");
    printer.println("puede ser consultada en");
    printer.println(
      "http://comprobantes.facturactiva.com/ecotrade/visorComprobantes"
    );

    printer.newLine();
    printer.printQR("https://olaii.com");

    printer.newLine();
    printer.println("Proveedor de Servicios Electronicos");
    printer.newLine();

    printer.printImage(path2, done => {
      printer.newLine();
      const date = new Date();
      printer.println(`Fecha y Hora de Impresion: ${date}`);

      printer.cut();
      printer.openCashDrawer();
      printer.execute();
      // console.log(printer.getText());
      printer.clear();
    });
  });

  documento.dataPago = dataPago;
  documento.clientZoho = clientZoho;
  documento.docID = docID;

  if (goZoho && controlZoho) {
    sendInvoiceToZoho(documento);
  } else {
    //REENVIO A FACTIVA Y ZOHO
    if (!goZoho) {
      await Reenvio.create(documento);
      awakeDaemon().catch(err => console.log(err));
    }
  }
});

router.post("/api/printdocument", async (req, res) => {
  const documento = req.body;
  const dataPago = documento.dataPago;
  const empleado = documento.empleado;
  const ticketImpreso = documento.ticketImpreso;

  res.json(documento);

  let referencia = "";

  for (let i = 0; i < dataPago.length; i++) {
    const pago = dataPago[i];
    if (i === 0) {
      pago.reference === ""
        ? (referencia = referencia + "Efectivo")
        : (referencia = referencia + `${pago.reference}`);
    } else {
      pago.reference === ""
        ? (referencia = referencia + " ,Efectivo")
        : (referencia = referencia + `, ${pago.reference}`);
    }
  }

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  let correlativo = `${documento.documento.serie}-${
    documento.documento.correlativo
  }`;

  let fechaEmis = documento.fechaEmision;
  let horaEmis = hour + ":" + minutes;
  let cliente = documento.documento.nombreReceptor;
  let clienteRuc = documento.documento.numDocReceptor;
  let direccion = documento.documento.direccionDestino;
  let tipoDoc;

  if (documento.tipoDocumento === "01") {
    tipoDoc = "FACTURA";
  } else {
    tipoDoc = "BOLETA";
  }
  writtenNumber.defaults.lang = "es";

  const cant = documento.documento.mntTotal.toFixed(2).split(".");
  const entero = cant[0];
  let decim = "";
  if (cant.length > 1) {
    decim = cant[1];
  }

  const writtenEnt = writtenNumber(entero);
  const writtenDec = writtenNumber(decim);

  const fullTotal =
    writtenEnt.toUpperCase() +
    " " +
    "Y" +
    " " +
    writtenDec.toUpperCase() +
    "/100";

  let items = [];

  for (let i = 0; i < ticketImpreso.length; i++) {
    item = ticketImpreso[i];
    items.push([
      { text: item.cantidadItem, align: "CENTER", width: 0.1 },
      { text: `${item.sku}`, align: "CENTER", width: 0.25 },
      { text: item.nombreItem, align: "LEFT", width: 0.8 },
      { text: item.precioItemSinIgv.toFixed(2), width: 0.125, align: "RIGHT" }
    ]);
  }

  initPrinter();

  printer.alignCenter();
  printer.bold(true);
  const path = join(__dirname, "..", "assets", `${LOGO}.png`);
  const path2 = join(__dirname, "..", "assets", "facturactiva.png");
  printer.printImage(path, done => {
    printer.bold(false);
    printer.newLine();
    printer.setTypeFontB();

    printer.bold(true);
    printer.println(`RAZON SOCIAL: ${RAZON_SOCIAL}`);

    //2
    printer.bold(false);
    printer.println(`RUC: ${RUC} Nro.: ${correlativo}`);

    //3
    printer.println(DIRECCION);

    //4
    printer.bold(true);
    printer.println(`${tipoDoc} ELECTRONICA`);

    //5
    printer.bold(true);
    printer.println(`Fecha Emis.: ${fechaEmis} Hora Emis.: ${horaEmis}`);

    //6
    printer.bold(false);
    printer.println(TELEFONO);

    printer.alignLeft();
    printer.newLine();

    printer.println(`SENOR(ES).: ${cliente}`);
    printer.println(`R.U.C.:     ${clienteRuc}`);
    printer.println(`DIRECCION:  ${direccion}`);

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

    let subTotal = 0;

    if (_.isUndefined(documento.descuento)) {
      subTotal = documento.documento.mntNeto;
    } else {
      subTotal = (
        parseFloat(documento.documento.mntNeto) +
        parseFloat(documento.descuento.mntTotalDescuentos)
      ).toFixed(2);
    }

    printer.println(
      "                 SUB-TOTAL S/:                           " + subTotal
    );
    printer.println(
      _.isUndefined(documento.descuento)
        ? `                 DSCTO S/:                               0.00`
        : `                 DSCTO S/:                              ${
            documento.descuento.mntTotalDescuentos === 0 ? " " : "-"
          }${documento.descuento.mntTotalDescuentos.toFixed(2)}`
    );
    printer.println(
      "                 OP. GRAVADA S/:                         " +
        documento.documento.mntNeto.toFixed(2)
    );
    printer.println(
      "                 OP INAFECTA S/:                         " + "0.00"
    );
    printer.println(
      "                 OP EXONERADA S/:                        " + "0.00"
    );
    printer.println(
      "                 RECARGO CONSUMO 10% S/:                 " +
        documento.impuesto.length >
        1
        ? documento.impuesto[1].montoImpuesto.toFixed(2)
        : "0.00"
    );
    printer.println(
      "                 TOTAL IGV 18% S/:                       " +
        documento.impuesto[0].montoImpuesto.toFixed(2)
    );
    printer.bold(true);
    printer.println(
      "                 IMPORTE TOTAL S/:                       " +
        documento.documento.mntTotal.toFixed(2)
    );

    printer.bold(false);
    printer.newLine();

    printer.println(`SON: ${fullTotal} Soles`);
    printer.println(`CAJERO: ${empleado}`);
    printer.println(`REFERENCIA: ${referencia}`);

    printer.newLine();
    printer.alignCenter();

    printer.println("Autorizado mediante");
    printer.println("Resolucion de intendencia - N 034-005-0005294/SUNAT");
    printer.println("Representacion impresa del Comprobante electronico");
    printer.println("puede ser consultada en");
    printer.println(
      "http://comprobantes.facturactiva.com/ecotrade/visorComprobantes"
    );

    printer.newLine();
    printer.printQR("https://olaii.com");

    printer.newLine();
    printer.println("Proveedor de Servicios Electronicos");
    printer.newLine();

    printer.printImage(path2, done => {
      printer.newLine();
      const date = new Date();
      printer.println(`Fecha y Hora de Impresion: ${date}`);

      printer.cut();
      printer.execute();
      // console.log(printer.getText());
      printer.clear();
    });
  });
});

router.post("/api/precuenta", async (req, res) => {
  const documento = req.body;
  const ticketImpreso = documento.ticketImpreso;
  const mesa = documento.mesa;
  const mesaID = documento.mesaID;
  const io = req.app.get("socketio");

  const updateMesaEstado = await Mesa.findOne({ _id: mesaID })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .then(myMesa => {
      let estado = myMesa.estado;
      if (estado !== "Master" && estado !== "Por Pagar") {
        estado = "Por Cobrar";
      }
      myMesa.estado = estado;
      myMesa.save();

      io.emit("updateMesa", myMesa);
    });

  res.json(documento);

  // const roundHalf = num => {
  //   return Math.round(num * 2) / 2;
  // };

  let hour = moment.tz("America/Lima").hours();
  let minutes = moment.tz("America/Lima").minutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  let fechaEmis = documento.fechaEmision;
  let horaEmis = hour + ":" + minutes;

  let items = [];

  for (let i = 0; i < ticketImpreso.length; i++) {
    item = ticketImpreso[i];
    let precio = item.precioItemSinIgv * tax;

    items.push([
      { text: item.cantidadItem, align: "CENTER", width: 0.1 },
      { text: `${item.sku}`, align: "CENTER", width: 0.25 },
      { text: item.nombreItem, align: "LEFT", width: 0.8 },
      { text: precio.toFixed(2), width: 0.125, align: "RIGHT" }
    ]);
  }

  initPrinter();

  printer.alignCenter();
  printer.bold(true);
  const path = join(__dirname, "..", "assets", `${LOGO}.png`);
  printer.printImage(path, done => {
    printer.bold(false);
    printer.newLine();
    printer.setTypeFontB();

    printer.println(`${DIRECCION} - ${TELEFONO}`);
    printer.bold(true);
    printer.println(`PRECUENTA MESA ${mesa}`);
    printer.bold(true);
    printer.println("Fecha Emis.: " + fechaEmis + " Hora Emis.: " + horaEmis);
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

    let subTotal = 0;

    if (_.isUndefined(documento.descuento)) {
      subTotal = documento.documento.mntNeto;
    } else {
      subTotal = (
        parseFloat(documento.documento.mntNeto) +
        parseFloat(documento.descuento.mntTotalDescuentos)
      ).toFixed(2);
    }

    printer.println(
      "                 SUB-TOTAL S/:                           " +
        (subTotal * tax).toFixed(2)
    );
    documento.descuento.mntTotalDescuentos > 0
      ? printer.println(
          _.isUndefined(documento.descuento)
            ? `                 DSCTO S/:                               0.00`
            : `                 DSCTO S/:                              -${(
                documento.descuento.mntTotalDescuentos * tax
              ).toFixed(2)}`
        )
      : "";

    printer.bold(true);
    printer.println(
      "                 IMPORTE TOTAL S/:                       " +
        documento.documento.mntTotal.toFixed(2)
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
    printer.execute();
    // console.log(printer.getText());
    printer.clear();
  });
});

// router.post("/api/precuenta1", async (req, res) => {
//   const documento = req.body;
//   const ticketImpreso = documento.ticketImpreso;
//   const mesa = documento.mesa;
//   const mesaID = documento.mesaID;
//   const io = req.app.get("socketio");

//   const updateMesaEstado = await Mesa.findOne({ _id: mesaID })
//     .populate({
//       path: "empleados",
//       populate: {
//         path: "mensajes"
//       }
//     })
//     .then(myMesa => {
//       let estado = myMesa.estado;
//       if (estado !== "Master" && estado !== "Por Pagar") {
//         estado = "Por Cobrar";
//       }
//       myMesa.estado = estado;
//       myMesa.save();

//       io.emit("updateMesa", myMesa);
//     });

//   res.json(documento);

//   // const roundHalf = num => {
//   //   return Math.round(num * 2) / 2;
//   // };

//   let hour = moment.tz("America/Lima").hours();
//   let minutes = moment.tz("America/Lima").minutes();

//   if (minutes < 10) {
//     minutes = "0" + minutes;
//   }

//   let fechaEmis = documento.fechaEmision;
//   let horaEmis = hour + ":" + minutes;

//   let items = [];

//   for (let i = 0; i < ticketImpreso.length; i++) {
//     item = ticketImpreso[i];
//     let precio = item.precioItemSinIgv * tax;

//     items.push([
//       { text: item.cantidadItem, align: "CENTER", width: 0.1 },
//       { text: `${item.sku}`, align: "CENTER", width: 0.25 },
//       { text: item.nombreItem, align: "LEFT", width: 0.8 },
//       { text: precio.toFixed(2), width: 0.125, align: "RIGHT" }
//     ]);
//   }

//   initPrinter1();

//   printer.alignCenter();
//   printer.bold(true);
//   const path = join(__dirname, "..", "assets", `${LOGO}.png`);
//   printer.printImage(path, done => {
//     printer.bold(false);
//     printer.newLine();
//     printer.setTypeFontB();

//     printer.println(`${DIRECCION} - ${TELEFONO}`);
//     printer.bold(true);
//     printer.println(`PRECUENTA MESA ${mesa}`);
//     printer.bold(true);
//     printer.println("Fecha Emis.: " + fechaEmis + " Hora Emis.: " + horaEmis);
//     printer.bold(false);
//     printer.alignLeft();
//     printer.newLine();

//     printer.alignLeft();
//     printer.setTypeFontA();
//     printer.drawLine();
//     printer.setTypeFontB();

//     printer.table([
//       "Cant.",
//       "Cod.",
//       "Descripcion",
//       "                       ",
//       "Importe"
//     ]);

//     printer.setTypeFontA();
//     printer.drawLine();
//     printer.setTypeFontB();

//     items.forEach(item => {
//       printer.tableCustom(item);
//     });

//     printer.setTypeFontA();
//     printer.drawLine();
//     printer.setTypeFontB();

//     let subTotal = 0;

//     if (_.isUndefined(documento.descuento)) {
//       subTotal = documento.documento.mntNeto;
//     } else {
//       subTotal = (
//         parseFloat(documento.documento.mntNeto) +
//         parseFloat(documento.descuento.mntTotalDescuentos)
//       ).toFixed(2);
//     }

//     printer.println(
//       "                 SUB-TOTAL S/:                           " +
//         (subTotal * tax).toFixed(2)
//     );
//     documento.descuento.mntTotalDescuentos > 0
//       ? printer.println(
//           _.isUndefined(documento.descuento)
//             ? `                 DSCTO S/:                               0.00`
//             : `                 DSCTO S/:                              -${(
//                 documento.descuento.mntTotalDescuentos * tax
//               ).toFixed(2)}`
//         )
//       : "";

//     printer.bold(true);
//     printer.println(
//       "                 IMPORTE TOTAL S/:                       " +
//         documento.documento.mntTotal.toFixed(2)
//     );

//     printer.bold(false);
//     printer.newLine();

//     printer.println(
//       `Razon social:___________________________________________________`
//     );
//     printer.newLine();
//     printer.println(
//       `            :___________________________________________________`
//     );
//     printer.newLine();
//     printer.println(
//       `Ruc         :___________________________________________________`
//     );
//     printer.newLine();
//     printer.println(
//       `Correo      :___________________________________________________`
//     );
//     printer.newLine();

//     printer.println(
//       `Este documento no es un comprobante de pago, es un estado de cuenta.`
//     );

//     printer.cut();
//     printer.execute();
//     // console.log(printer.getText());
//     printer.clear();
//   });
// });

// router.post("/api/precuenta2", async (req, res) => {
//   const documento = req.body;
//   const ticketImpreso = documento.ticketImpreso;
//   const mesa = documento.mesa;
//   const mesaID = documento.mesaID;
//   const io = req.app.get("socketio");

//   const updateMesaEstado = await Mesa.findOne({ _id: mesaID })
//     .populate({
//       path: "empleados",
//       populate: {
//         path: "mensajes"
//       }
//     })
//     .then(myMesa => {
//       let estado = myMesa.estado;
//       if (estado !== "Master" && estado !== "Por Pagar") {
//         estado = "Por Cobrar";
//       }
//       myMesa.estado = estado;
//       myMesa.save();

//       io.emit("updateMesa", myMesa);
//     });

//   res.json(documento);

//   // const roundHalf = num => {
//   //   return Math.round(num * 2) / 2;
//   // };

//   let hour = moment.tz("America/Lima").hours();
//   let minutes = moment.tz("America/Lima").minutes();

//   if (minutes < 10) {
//     minutes = "0" + minutes;
//   }

//   let fechaEmis = documento.fechaEmision;
//   let horaEmis = hour + ":" + minutes;

//   let items = [];

//   for (let i = 0; i < ticketImpreso.length; i++) {
//     item = ticketImpreso[i];
//     let precio = item.precioItemSinIgv * tax;

//     items.push([
//       { text: item.cantidadItem, align: "CENTER", width: 0.1 },
//       { text: `${item.sku}`, align: "CENTER", width: 0.25 },
//       { text: item.nombreItem, align: "LEFT", width: 0.8 },
//       { text: precio.toFixed(2), width: 0.125, align: "RIGHT" }
//     ]);
//   }

//   initPrinter2();

//   printer.alignCenter();
//   printer.bold(true);
//   const path = join(__dirname, "..", "assets", `${LOGO}.png`);
//   printer.printImage(path, done => {
//     printer.bold(false);
//     printer.newLine();
//     printer.setTypeFontB();

//     printer.println(`${DIRECCION} - ${TELEFONO}`);
//     printer.bold(true);
//     printer.println(`PRECUENTA MESA ${mesa}`);
//     printer.bold(true);
//     printer.println("Fecha Emis.: " + fechaEmis + " Hora Emis.: " + horaEmis);
//     printer.bold(false);
//     printer.alignLeft();
//     printer.newLine();

//     printer.alignLeft();
//     printer.setTypeFontA();
//     printer.drawLine();
//     printer.setTypeFontB();

//     printer.table([
//       "Cant.",
//       "Cod.",
//       "Descripcion",
//       "                       ",
//       "Importe"
//     ]);

//     printer.setTypeFontA();
//     printer.drawLine();
//     printer.setTypeFontB();

//     items.forEach(item => {
//       printer.tableCustom(item);
//     });

//     printer.setTypeFontA();
//     printer.drawLine();
//     printer.setTypeFontB();

//     let subTotal = 0;

//     if (_.isUndefined(documento.descuento)) {
//       subTotal = documento.documento.mntNeto;
//     } else {
//       subTotal = (
//         parseFloat(documento.documento.mntNeto) +
//         parseFloat(documento.descuento.mntTotalDescuentos)
//       ).toFixed(2);
//     }

//     printer.println(
//       "                 SUB-TOTAL S/:                           " +
//         (subTotal * tax).toFixed(2)
//     );
//     documento.descuento.mntTotalDescuentos > 0
//       ? printer.println(
//           _.isUndefined(documento.descuento)
//             ? `                 DSCTO S/:                               0.00`
//             : `                 DSCTO S/:                              -${(
//                 documento.descuento.mntTotalDescuentos * tax
//               ).toFixed(2)}`
//         )
//       : "";

//     printer.bold(true);
//     printer.println(
//       "                 IMPORTE TOTAL S/:                       " +
//         documento.documento.mntTotal.toFixed(2)
//     );

//     printer.bold(false);
//     printer.newLine();

//     printer.println(
//       `Razon social:___________________________________________________`
//     );
//     printer.newLine();
//     printer.println(
//       `            :___________________________________________________`
//     );
//     printer.newLine();
//     printer.println(
//       `Ruc         :___________________________________________________`
//     );
//     printer.newLine();
//     printer.println(
//       `Correo      :___________________________________________________`
//     );
//     printer.newLine();

//     printer.println(
//       `Este documento no es un comprobante de pago, es un estado de cuenta.`
//     );

//     printer.cut();
//     printer.execute();
//     // console.log(printer.getText());
//     printer.clear();
//   });
// });

router.post("/api/reenviozoho", (req, res) => {
  res.json({ sms: "processing" });
  sendInvoiceToZoho(req.body);
});

//metodo PUT
router.put("/api/documentos", (req, res) => {
  res.json({ sms: "processing" });
  Reenvio.find().then(async documents => {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      let dataPago = {
        tipoPago: "EFECTIVO",
        reference: "",
        monto: doc.documento.mntTotal
      };
      await Reenvio.findOneAndUpdate(
        { _id: doc._id },
        { $set: { dataPago: dataPago } }
      ).exec();
    }
  });
});

router.put("/api/documentosdel", (req, res) => {
  res.json({ sms: "processing" });
  Documento.find().then(async documents => {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      for (let j = 0; j < renv.length; j++) {
        const re = renv[j];
        if (doc.documento.correlativo === re) {
          let dataPago = {
            tipoPago: "EFECTIVO",
            reference: "",
            monto: doc.documento.mntTotal
          };
          let docu = { ...doc._doc };
          docu.dataPago = dataPago;
          await Reenvio.create(docu);
          // equals.push(doc);
        }
      }
    }
  });
});

module.exports = router;
