const mongoose = require("mongoose");
const Comanda = require("./comanda");
const _ = require("underscore");
const lo = require("lodash");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  cobrado: { type: Boolean, default: false },
  order: String,
  sent: { type: Boolean, default: true }
});

const mesaSchema = new Schema({
  numeroMesa: {
    type: String
  },
  master: {
    type: String,
    default: ""
  },
  estado: {
    type: String,
    default: "Libre"
  },
  especial: {
    type: String,
    default: "normal"
  },
  ubicacion: {
    type: String,
    default: "Sin especificar"
  },
  comandas: {
    type: [{ type: Schema.Types.ObjectId, ref: "Comanda" }],
    default: []
  },
  empleados: {
    type: [{ type: Schema.Types.ObjectId, ref: "Empleado" }],
    default: []
  },
  orders: [orderSchema],
  tipoDescuento: { type: String, default: "" },
  acumuladoDescuento: { type: Number, default: 0 },
  pax: { type: Number, default: 0 }
});

const Mesa = (module.exports = mongoose.model("Mesa", mesaSchema));

//Get Mesas
module.exports.getMesas = (callback, limit) => {
  Mesa.find(callback)
    // .populate("orders")
    // .populate("empleados")
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .limit(limit);
};

//Get Mesas Mesero
module.exports.getMesasMobile = (callback, limit) => {
  Mesa.find(callback)
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    // .populate("empleados")
    // .populate("orders")
    .limit(limit);
};

//Get Mesa
module.exports.getMesaById = (id, callback) => {
  Mesa.findById(id.id, callback)
    .populate({
      path: "comandas",
      populate: {
        path: "empleado"
      }
    })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    });
  // .populate("orders");
};

//Get Mesa
module.exports.getMesaByIdRest = (id, callback) => {
  Mesa.findById(id, callback)
    // .populate({
    //   path: "comandas",
    //   populate: {
    //     path: "empleado"
    //   }
    // })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    });
  // .populate("orders");
};

//Change Mesa
module.exports.getMesaByIdChange = async (data, callback) => {
  let oriId = data.original;
  let toChanId = data.toChange;
  let io = data.io;
  let original = {};

  const ori = await Mesa.findOne({ _id: oriId })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .then(mesaOriginal => {
      original = lo.cloneDeep(mesaOriginal);
      mesaOriginal.estado = "Libre";
      mesaOriginal.comandas = [];
      mesaOriginal.tipoDescuento = "";
      mesaOriginal.pax = 0;
      mesaOriginal.empleados = [];
      mesaOriginal.orders = [];
      mesaOriginal.save();
      io.emit("updateMesa", mesaOriginal);
    });

  const dest = await Mesa.findOne({ _id: toChanId })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .then(mesaDestiny => {
      mesaDestiny.estado = original.estado;
      // mesaDestiny.comandas = original.comandas;
      mesaDestiny.tipoDescuento = original.tipoDescuent;
      mesaDestiny.pax = original.pax;
      mesaDestiny.empleados = original.empleados;
      original.orders.forEach(order => {
        mesaDestiny.orders.push(order);
      });
      mesaDestiny.save(callback);
      io.emit("updateMesa", mesaDestiny);
    });
};

//Change Item
module.exports.getMesaByIdChangeItem = (data, callback) => {
  let oriId = data.original;
  let toChanId = data.toChange;
  let itemId = data.item;
  let item;
  let empleado;

  Mesa.findOneAndUpdate({ _id: oriId })
    .then(mesaOriginal => {
      empleado = mesaOriginal.empleados[0];
      item = mesaOriginal.orders.find(order => {
        return order._id.toString().trim() === itemId;
      });

      let items = _.without(mesaOriginal.orders, item);

      items.forEach(element => {
        if (!element.cobrado) canDelete = false;
      });

      if (canDelete) {
        mesaOriginal.estado = "Libre";
        mesaOriginal.empleados = [];
        mesaOriginal.comandas = [];
        mesaOriginal.tipoDescuento = "";
        mesaOriginal.acumuladoDescuento = 0;
        mesaOriginal.pax = 0;
      }

      mesaOriginal.orders = items;
      mesaOriginal.save();

      Mesa.findOneAndUpdate({ _id: toChanId }, { new: true });
    })
    .then(mesa => {
      mesa.estado = mesa.estado === "Master" ? mesa.estado : "Ocupada";
      mesa.orders.push(item);
      mesa.empleados.push(empleado);
      mesa.comandas = [];
      mesa.pax = mesa.pax === 0 ? 1 : mesa.pax;
      mesa.save(callback);
    });
};

module.exports.getMesaByIdUpdate = (id, callback) => {
  Mesa.findById(id, callback).populate("empleados");
};

//Add Mesa
module.exports.addMesa = (mesa, callback) => {
  Mesa.create(mesa, callback);
};

module.exports.desunirMesa = (id, callback) => {
  const query = { _id: id };
  Mesa.findOneAndUpdate(
    query,
    {
      $set: {
        comandas: [],
        empleados: [],
        estado: "Libre",
        master: "",
        orders: []
      }
    },
    { new: true },
    callback
  );
};

//Update Mesa COMANDAS
// module.exports.updateMesaComanda = (id, mesa, orders, options) => {
//   const query = { _id: id };
//   const comandas = mesa.comandas;
//   const empleado = mesa.empleado;
//   const newOrders = [];

//   orders.forEach(order => {
//     let newOrder = {};

//     const theNum = order.match(/\(([^)]+)\)/)[1];
//     const newstr = order.replace(`(${theNum})`, "(1)");
//     for (let i = 0; i < theNum; i++) {
//       newOrder.order = newstr;
//       newOrders.push(newOrder);
//     }
//   });

//   let estado = "Ocupada";
//   if (mesa.estado === "Master") {
//     estado = mesa.estado;
//   }

//   Mesa.findOneAndUpdate(
//     query,
//     {
//       $push: { comandas: comandas, empleados: empleado, orders: newOrders },
//       $set: { estado: estado, pax: mesa.pax }
//     },
//     options,
//     callback
//   );
// };

const clear = (slaves, io) => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < slaves.length; i++) {
      const mesaSlave = slaves[i];
      const clearing = await Mesa.findByIdAndUpdate(
        mesaSlave.id,
        {
          $set: {
            comandas: [],
            empleados: [],
            estado: "Libre",
            master: "",
            orders: [],
            tipoDescuento: "",
            acumuladoDescuento: 0,
            pax: 0
          }
        },
        { new: true }
      );
      io.emit("updateMesa", clearing);
    }
    resolve("done");
  });
};

//Clear Mesa
module.exports.clearTable = (data, options, callback) => {
  const io = data.req.app.get("socketio");
  Mesa.findOne({ _id: data.table }, callback).then(async mesa => {
    let slaves = [];
    const comandas = mesa.comandas;
    if (mesa.estado === "Master") {
      slaves = await Mesa.find({ master: mesa.master });
      const clearSlaves = await clear(slaves, io).catch(err =>
        console.log(err)
      );
    }
    for (let i = 0; i < comandas.length; i++) {
      const comanda = comandas[i]._id;
      Comanda.deleteComanda(comanda, (err, comanda) => {
        if (err) {
          throw err;
        }
      });
    }
    mesa.comandas = [];
    mesa.empleados = [];
    mesa.estado = "Libre";
    mesa.master = "";
    mesa.orders = [];
    mesa.tipoDescuento = "";
    mesa.acumuladoDescuento = 0;
    mesa.pax = 0;
    io.emit("updateMesa", mesa);
    mesa.save();
  });
};

// //Charge Item { new: true } retorna el objeto updateado
module.exports.chargeItem = (idMesa, idItem, callback) => {
  Mesa.findOneAndUpdate(
    { _id: idMesa, "orders._id": idItem },
    { $set: { "orders.$.cobrado": true } },
    { new: true },
    callback
  );
};

//Delete Mesa
module.exports.deleteMesa = (id, callback) => {
  const query = { _id: id };
  Mesa.deleteOne(query, callback);
};
