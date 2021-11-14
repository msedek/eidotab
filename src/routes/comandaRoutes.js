const express = require("express");
const router = express.Router();
const printer = require("node-thermal-printer");
const printer2 = require("node-thermal-printer");
const moment = require("moment");

const Comanda = require("../models/comanda");
const Mesa = require("../models/mesa");
const Empleado = require("../models/empleado");
const Fondo = require("../models/fondo");
const Insumo = require("../models/insumo");
const Receta = require("../models/recetaYacho");

const configs = require("../configs/configs");

const impresoraCocina = configs.impresoraCocina;
const impresoraBar = configs.impresoraBar;
const subRed = configs.subRed;
const CONTROL_ZOHO = configs.controlZoho;
const TWO_ORDERS = configs.twoOrders;

//metodo GET
router.get("/api/comandas", (req, res) => {
  Comanda.getComandas((err, comandas) => {
    if (err) {
      throw err;
    }
    res.json(comandas);
  });
});

router.get("/api/comanda/:_id", (req, res) => {
  Comanda.getComandaById(req.params._id, (err, comanda) => {
    if (err) {
      throw err;
    }
    res.json(comanda);
  });
});

//metodo POST
// router.post("/api/comandas", async (req, res) => {
//   const comandaRec = req.body;
//   const io = req.app.get("socketio");
//   res.json(comandaRec);
//   if (comandaRec.orders.length > 0) {
//     let fondoId = comandaRec.fondoId;

//     if (parseInt(comandaRec.pax, 10) < 50000) {
//       Fondo.findOneAndUpdate(
//         { _id: fondoId },
//         { $inc: { pax: parseInt(comandaRec.pax, 10) } }
//       ).exec();
//     }

//     comandaRec.numero_comanda = await Comanda.create(comandaRec).then(
//       comanda => {
//         return comanda.numero_comanda;
//       }
//     );

//     const query = { _id: comandaRec.mesa };
//     const newOrders = [];

//     comandaRec.orders.forEach(order => {
//       let newOrder = {};
//       const theNum = order.match(/\(([^)]+)\)/)[1];
//       const newstr = order.replace(`(${theNum})`, "(1)");
//       for (let i = 0; i < theNum; i++) {
//         newOrder.order = newstr;
//         newOrders.push(newOrder);
//       }
//     });

//     let estado = "Ocupada";
//     if (comandaRec.mesaEstado === "Master") {
//       estado = comandaRec.mesaEstado;
//     }

//     await Mesa.findOneAndUpdate(query, {
//       $push: {
//         empleados: comandaRec.empleado,
//         orders: newOrders
//       },
//       $set: { estado: estado, pax: parseInt(comandaRec.pax, 10) }
//     }).exec();

//     let mandar = false;
//     let mandar2 = false;
//     let mandar3 = false;

//     let myProduct = "";

//     comandaRec.orders.forEach(orden => {
//       let selector = orden.split("-");
//       // const order = selector[0];
//       let category = selector[1].toUpperCase();
//       let data = selector[2];
//       let selector2 = data.split("*");
//       myProduct = selector2[1];
//       // const note = selector[3];

//       switch (category) {
//         case "ADICIONALES":
//         case "COMODOS":
//         case "DIRECTOS":
//         case "ENTRADAS":
//         case "ENSALADAS":
//         case "TAPAS":
//         case "SOPAS":
//         case "MENU (ENTRADAS)":
//         case "MENU (FONDOS)":
//         case "FONDOS":
//         case "PLANCHAS Y PARRILLAS":
//         case "PASTAS":
//         case "PIQUEOS":
//         case "POSTRES CARTA":
//         case "DESAYUNOS (CARTA)":
//           mandar = true;
//           break;
//         case "MENU DEL DIA":
//           mandar3 = true;
//           break;
//         default:
//           mandar2 = true;
//           break;
//       }
//     });

//     if(false) { //solo demo ahora
//       await Receta.findById({ _id: myProduct }).then(async receta => {
//         for (let i = 0; i < receta.cf_ingredientesLocal.length; i++) {
//           const insumoId = receta.cf_ingredientesLocal[i].id;
//           const quantity = receta.cf_ingredientesLocal[i].cantidad;
//           const unity = receta.cf_ingredientesLocal[i].unidad;
//           let update = 0;

//           switch (unity) {
//             case "Gramos":
//             case "Mililitros":
//               update = parseFloat((quantity / 1000).toFixed(2));
//               break;
//             default:
//               update = quantity;
//               break;
//           }

//           await Insumo.findByIdAndUpdate(
//             { _id: insumoId },
//             { $inc: { existence: -update } }
//           );
//         }
//       });
//     }

//     if (mandar) {
//       await print(comandaRec);
//       await print(comandaRec);
//     } //PRINT TO COCINA
//     if (mandar2) {
//       await print2(comandaRec);
//       await print2(comandaRec);
//     } //PRINT TO BARRA
//     if (mandar3) {
//       await print2(comandaRec); //PRINT TO BARRA
//       await print2(comandaRec);
//       await print(comandaRec); //PRINT TO BARRA
//       await print(comandaRec);
//     }

//     const mesa = await Mesa.findOne({ _id: comandaRec.mesa }).populate({
//       path: "empleados",
//       populate: {
//         path: "mensajes"
//       }
//     });

//     io.emit("updateMesa", mesa);
//   }
// });

router.post("/api/comandas", async (req, res) => {
  const comandaRec = req.body;
  const io = req.app.get("socketio");
  res.json(comandaRec);

  // console.log("lin 44 comandaRoutes", comandaRec);

  if (comandaRec.orders.length > 0) {
    let fondoId = comandaRec.fondoId;

    if (parseInt(comandaRec.pax, 10) < 50000) {
      Fondo.findOneAndUpdate(
        { _id: fondoId },
        { $inc: { pax: parseInt(comandaRec.pax, 10) } }
      ).exec();
    }

    comandaRec.numero_comanda = await Comanda.create(comandaRec).then(
      comanda => {
        return comanda.numero_comanda;
      }
    );

    const query = { _id: comandaRec.mesa };
    const newOrders = [];
    let theNum;

    comandaRec.orders.forEach(order => {
      let newOrder = {};
      theNum = order.match(/\(([^)]+)\)/)[1];
      const newstr = order.replace(`(${theNum})`, "(1)");
      for (let i = 0; i < theNum; i++) {
        newOrder.order = newstr;
        newOrders.push(newOrder);
      }
    });

    let estado = "Ocupada";
    if (comandaRec.mesaEstado === "Master") {
      estado = comandaRec.mesaEstado;
    }

    await Mesa.findOneAndUpdate(query, {
      $push: {
        empleados: comandaRec.empleado,
        orders: newOrders
      },
      $set: { estado: estado, pax: parseInt(comandaRec.pax, 10) }
    }).exec();

    let mandar = false;
    let mandar2 = false;
    let mandar3 = false;

    let myProduct = "";

    comandaRec.orders.forEach(orden => {
      let selector = orden.split("-");
      // const order = selector[0];
      let category = selector[1].toUpperCase();
      let data = selector[2];
      let selector2 = data.split("*");
      myProduct = selector2[1];
      // const note = selector[3];

      switch (category) {
        case "ADICIONALES":
        case "COMODOS":
        case "DIRECTOS":
        case "ENTRADAS":
        case "ENSALADAS":
        case "TAPAS":
        case "SOPAS":
        case "MENU (ENTRADAS)":
        case "MENU (FONDOS)":
        case "FONDOS":
        case "PLANCHAS Y PARRILLAS":
        case "PASTAS":
        case "PIQUEOS":
        case "POSTRES CARTA":
        case "DESAYUNOS (CARTA)":
          mandar = true;
          break;
        case "MENU DEL DIA":
          mandar3 = true;
          break;
        default:
          mandar2 = true;
          break;
      }
    });

    if (!CONTROL_ZOHO) {
      await Receta.findById({ _id: myProduct }).then(async receta => {
        for (let i = 0; i < receta.cf_ingredientesLocal.length; i++) {
          const insumoId = receta.cf_ingredientesLocal[i].id;
          const quantity = receta.cf_ingredientesLocal[i].cantidad;
          const unity = receta.cf_ingredientesLocal[i].unidad;
          let update = 0;

          switch (unity) {
            case "Gramos":
            case "Mililitros":
              update = parseFloat((quantity / 1000).toFixed(2));
              break;
            default:
              update = quantity;
              break;
          }

          await Insumo.findByIdAndUpdate(
            { _id: insumoId },
            { $inc: { existence: -update * parseFloat(theNum) } }
          );
        }
      });
    }

    if (mandar) {
      await print(comandaRec);
      if (TWO_ORDERS) await print(comandaRec);
    } //PRINT TO COCINA
    if (mandar2) {
      await print2(comandaRec);
      if (TWO_ORDERS) await print2(comandaRec);
    } //PRINT TO BARRA
    if (mandar3) {
      await print2(comandaRec); //PRINT TO BARRA`
      if (TWO_ORDERS) await print2(comandaRec);
      await print(comandaRec); //PRINT TO BARRA
      if (TWO_ORDERS) await print(comandaRec);
    }

    const mesa = await Mesa.findOne({ _id: comandaRec.mesa }).populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    });

    io.emit("updateMesa", mesa);
  }
});

const print = data => {
  return new Promise(async (resolve, reject) => {
    const date = moment(data.fechaorden).format("lll");
    const mesa = data.numeroMesa;
    const comanda = data.numero_comanda;

    const vendor_name = await Empleado.findOne({ _id: data.empleado }).then(
      empleado => {
        return empleado.vendor_name;
      }
    );

    const mozo = vendor_name;
    const adicionales = [];
    const desayunosCarta = [];
    const entradas = [];
    const ensaladas = [];
    const piqueos = [];
    const tapas = [];
    const sopas = [];

    const menuEntradas = [];
    const fondos = [];
    const planchasParrillas = [];
    const pastas = [];
    const menuFondos = [];
    const comodos = [];
    const postresCarta = [];
    const directos = [];
    const menuDelDia = [];

    data.orders.forEach(orden => {
      let theOrder = [];
      const selector = orden.split("-");
      const order = selector[0];
      const category = selector[1].toUpperCase();
      const nota = selector[3];

      let formatData = order;
      let splitData = formatData.split(".");

      splitData.forEach((element, i) => {
        if (i === 0) {
          if (i === 0) {
          } else {
            printer.println("   " + element);
          }
          let subSplitData = element.split("_");
          let result = subSplitData[1] + " " + subSplitData[0];
          theOrder.push(result);
        } else {
          theOrder.push(element);
        }
      });

      if (nota !== undefined) {
        if (nota.length > 0) {
          theOrder.push(nota);
        }
      }

      switch (category) {
        case "ADICIONALES":
          adicionales.push(theOrder);
          break;
        case "COMODOS":
          comodos.push(theOrder);
          break;
        case "DIRECTOS":
          directos.push(theOrder);
          break;
        case "ENTRADAS":
          entradas.push(theOrder);
          break;
        case "ENSALADAS":
          ensaladas.push(theOrder);
          break;
        case "TAPAS":
          tapas.push(theOrder);
          break;
        case "SOPAS":
          sopas.push(theOrder);
          break;
        case "MENU (ENTRADAS)":
          menuEntradas.push(theOrder);
          break;
        case "MENU (FONDOS)":
          menuFondos.push(theOrder);
          break;
        case "FONDOS":
          fondos.push(theOrder);
          break;
        case "PLANCHAS Y PARRILLAS":
          planchasParrillas.push(theOrder);
          break;
        case "PASTAS":
          pastas.push(theOrder);
          break;
        case "PIQUEOS":
          piqueos.push(theOrder);
          break;
        case "POSTRES CARTA":
          postresCarta.push(theOrder);
          break;
        case "DESAYUNOS (CARTA)":
          desayunosCarta.push(theOrder);
          break;
        case "MENU DEL DIA":
          menuDelDia.push(theOrder);
          break;
      }
    });

    printer.init({
      type: printer.printerTypes.EPSON, // 'star' or 'epson'
      interface: `tcp://${subRed}${impresoraCocina}:9100`, // Linux interface COCINA ES 33
      width: 24, // Number of characters in one line (default 48) otras 20
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

    printer.setTextDoubleHeight();
    printer.setTextDoubleWidth();
    printer.bold(true);
    printer.alignCenter();
    printer.println(`COMANDA Nro: ${comanda}`);
    printer.drawLine();

    printer.alignCenter();
    printer.println(mozo);
    printer.drawLine();

    printer.alignLeft();
    printer.println(date);
    printer.drawLine();

    printer.alignLeft();
    printer.println(
      `PAX ${data.pax >= 50000 ? "N/A" : data.pax} | Mesa ${mesa}`
    );
    printer.drawLine();

    if (
      entradas.length > 0 ||
      ensaladas.length > 0 ||
      piqueos.length > 0 ||
      tapas.length > 0 ||
      sopas.length > 0
    ) {
      printer.alignCenter();
      printer.println("PRIMERA");
      printer.drawLine();
      printer.alignLeft();

      entradas.forEach(entrada => {
        entrada.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      ensaladas.forEach(ensalada => {
        ensalada.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      piqueos.forEach(piqueo => {
        piqueo.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      tapas.forEach(tapa => {
        tapa.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      sopas.forEach(sopa => {
        sopa.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      printer.drawLine();
      printer.alignLeft();
    }

    if (menuEntradas.length > 0) {
      printer.alignCenter();
      printer.println("ENTRADA MENU");
      printer.drawLine();
      printer.alignLeft();

      menuEntradas.forEach(menuEntrada => {
        menuEntrada.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      printer.drawLine();
      printer.alignLeft();
    }

    if (
      adicionales.length > 0 ||
      desayunosCarta.length > 0 ||
      fondos.length > 0 ||
      directos.length > 0 ||
      planchasParrillas.length > 0 ||
      pastas.length > 0 ||
      menuDelDia.length > 0
    ) {
      printer.alignCenter();
      printer.println("SEGUNDA");
      printer.drawLine();
      printer.alignLeft();

      desayunosCarta.forEach(desayuno => {
        desayuno.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      adicionales.forEach(adicional => {
        adicional.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      fondos.forEach(fondo => {
        fondo.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      directos.forEach(directo => {
        directo.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      planchasParrillas.forEach(planchasParrilla => {
        planchasParrilla.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      pastas.forEach(pasta => {
        pasta.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      menuDelDia.forEach(menu => {
        menu.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      printer.drawLine();
      printer.alignLeft();
    }

    if (menuFondos.length > 0 || comodos.length > 0) {
      printer.alignCenter();
      printer.println("FONDOS MENU");
      printer.drawLine();
      printer.alignLeft();

      menuFondos.forEach(menuFondo => {
        menuFondo.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      comodos.forEach(comodo => {
        comodo.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });

      printer.drawLine();
      printer.alignLeft();
    }

    if (postresCarta.length > 0) {
      printer.alignCenter();
      printer.println("POSTRES");
      printer.drawLine();
      printer.alignLeft();

      postresCarta.forEach(postre => {
        postre.forEach((element, i) => {
          if (i === 0) {
            printer.println(element);
          } else {
            printer.println("   " + element);
          }
        });
      });
    }

    printer.cut();
    printer.execute();
    // console.log(printer.getText());
    printer.clear();
    resolve();
  });
};

const print2 = data => {
  return new Promise(async (resolve, reject) => {
    const date = moment(data.fechaorden).format("lll");
    const mesa = data.numeroMesa;
    const comanda = data.numero_comanda;

    const vendor_name = await Empleado.findOne({ _id: data.empleado }).then(
      empleado => {
        return empleado.vendor_name;
      }
    );

    const mozo = vendor_name;
    const desayunosBarra = [];
    const combos = [];
    const bebidasFrias = [];
    const bebidasCalientes = [];
    const cervezas = [];
    const cocteleria = [];
    const vinos = [];
    const paquetesCorporativos = [];
    const menuBebidas = [];
    const postresBarra = [];
    const menuDelDia = [];

    data.orders.forEach(orden => {
      const selector = orden.split("-");
      const order = selector[0];
      const category = selector[1];
      const nota = selector[3];
      let theOrder = [];

      let formatData = order;
      let splitData = formatData.split(".");
      splitData.forEach((element, i) => {
        if (i === 0) {
          if (i === 0) {
          } else {
            printer.println("   " + element);
          }
          let subSplitData = element.split("_");
          let result = subSplitData[1] + " " + subSplitData[0];
          theOrder.push(result);
        } else {
          theOrder.push(element);
        }
      });

      if (nota !== undefined) {
        if (nota.length > 0) {
          theOrder.push(nota);
        }
      }

      switch (category.toUpperCase()) {
        case "DESAYUNOS (BARRA)":
          desayunosBarra.push(theOrder);
          break;
        case "MENU DEL DIA":
          menuDelDia.push(theOrder);
          break;
        case "COMBOS":
          combos.push(theOrder);
          break;
        case "BEBIDAS FRIAS":
        case "BEBIDAS":
          bebidasFrias.push(theOrder);
          break;
        case "BEBIDAS CALIENTES":
          bebidasCalientes.push(theOrder);
          break;
        case "CERVEZAS":
          cervezas.push(theOrder);
          break;
        case "COCTELERIA":
          cocteleria.push(theOrder);
          break;
        case "VINOS":
          vinos.push(theOrder);
          break;
        case "PAQUETES CORPORATIVOS":
          paquetesCorporativos.push(theOrder);
          break;
        case "MENU (BEBIDAS)":
          menuBebidas.push(theOrder);
          break;
        case "POSTRES BARRA":
          postresBarra.push(theOrder);
          break;
      }
    });

    printer2.init({
      type: printer2.printerTypes.EPSON, // 'star' or 'epson'
      interface: `tcp://${subRed}${impresoraBar}:9100`, // Linux interface  BARRA ES  50
      width: 24, // Number of characters in one line (default 48)
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
      ip: `${subRed}${impresoraBar}`, // Ethernet printing IP
      port: 9100 // Ethernet printing PORT
    });
    printer2.setTextDoubleHeight();
    printer2.setTextDoubleWidth();
    printer2.bold(true);
    printer2.alignCenter();
    printer2.println("COMANDA Nro:" + comanda);
    printer2.drawLine();

    printer2.alignCenter();
    printer2.println(mozo);
    printer2.drawLine();

    printer2.alignLeft();
    printer2.println(date);
    printer2.drawLine();

    printer2.alignLeft();
    printer2.println("PAX " + data.pax + " | Mesa " + mesa);
    printer2.drawLine();

    if (
      desayunosBarra.length > 0 ||
      combos.length > 0 ||
      bebidasFrias.length > 0 ||
      bebidasCalientes.length > 0 ||
      cervezas.length > 0 ||
      cocteleria.length > 0 ||
      vinos.length > 0 ||
      paquetesCorporativos.length > 0 ||
      menuDelDia.length > 0
    ) {
      printer2.alignCenter();
      printer2.println("SEGUNDA");
      printer2.drawLine();
      printer2.alignLeft();

      desayunosBarra.forEach(desayuno => {
        desayuno.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      menuDelDia.forEach(desayuno => {
        desayuno.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      combos.forEach(combo => {
        combo.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      bebidasFrias.forEach(bebidasFria => {
        bebidasFria.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      bebidasCalientes.forEach(bebidasCaliente => {
        bebidasCaliente.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      cervezas.forEach(cerveza => {
        cerveza.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      cocteleria.forEach(coctel => {
        coctel.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      vinos.forEach(vino => {
        vino.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      paquetesCorporativos.forEach(paquetesCorporativo => {
        paquetesCorporativo.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      printer2.drawLine();
      printer2.alignLeft();
    }

    if (menuBebidas.length > 0) {
      printer2.alignCenter();
      printer2.println("BEBIDAS MENU");
      printer2.drawLine();
      printer2.alignLeft();

      menuBebidas.forEach(menuBebida => {
        menuBebida.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });

      printer2.drawLine();
      printer2.alignLeft();
    }

    if (postresBarra.length > 0) {
      printer2.alignCenter();
      printer2.println("POSTRES");
      printer2.drawLine();
      printer2.alignLeft();

      postresBarra.forEach(postre => {
        postre.forEach((element, i) => {
          if (i === 0) {
            printer2.println(element);
          } else {
            printer2.println("   " + element);
          }
        });
      });
    }

    printer2.cut();
    printer2.execute();
    // console.log(printer2.getText());
    printer2.clear();
    resolve();
  });
};

//metodo PUT
router.put("/api/comandas/:_id", (req, res) => {
  const id = req.params._id;
  const comanda = req.body;
  Comanda.updateComanda(id, comanda, {}, (err, comanda) => {
    if (err) {
      throw err;
    }
    res.json(comanda);
  });
});

//metodo DELETE
router.delete("/api/comandas/:_id", (req, res) => {
  const id = req.params._id;
  Comanda.deleteComanda(id, (err, comanda) => {
    if (err) {
      throw err;
    }
    res.json(comanda);
  });
});

module.exports = router;
