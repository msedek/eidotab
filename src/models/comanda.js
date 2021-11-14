const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const Schema = mongoose.Schema;
const configs = require("../configs/configs");
const COUNTER = configs.comandaCounter;
// const Mesa = require("./mesa");
// const Order = require("./order");

const connection = mongoose.createConnection(COUNTER);
autoIncrement.initialize(connection);

const comandaSchema = new Schema({
  enviado: Boolean,
  orders: [],
  nro_comanda: String,
  numeroMesa: String,
  mesaEstado: String,
  estado: {
    type: String,
    default: "Cancelable" //Cobrar //Cancelado
  },
  fechaorden: {
    type: Date,
    default: Date.now
  },
  mesa: { type: Schema.Types.ObjectId, ref: "Mesa" },
  empleado: { type: Schema.Types.ObjectId, ref: "Empleado" }
});

comandaSchema.plugin(autoIncrement.plugin, {
  model: "Comanda",
  field: "numero_comanda"
});

const Comanda = (module.exports = mongoose.model("Comanda", comandaSchema));
//Get Comandas REST
module.exports.getComandas = (callback, limit) => {
  Comanda.find(callback)
    .populate("mesa")
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    })
    .limit(limit);
};

//Get Comanda ID REST
module.exports.getComandaById = (id, callback) => {
  Comanda.findById(id, callback)
    .populate("mesa")
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    });
};

//Get Comanda ID REST
module.exports.getComandaByIdUnir = (id, callback) => {
  Comanda.findById(id, callback);
};

// //Get Comanda SOCKET IS SOCKET
// module.exports.getComandaByIdSocket = (id, callback) => {
//   Comanda.find({ mesa: id }, callback)
//     .populate("mesa")
//     .populate("empleado")
//     .populate("recetas");
// };

// const addingOrder = (query, comanda)=>{
//   return new Promise(async(resolve, reject)=>{
//     for (let i = 0; i < comanda.orders.length; i++) {
//       const subOrder = comanda.orders[i];
//       const orden = new Order()
//       orden.order = subOrder
//       const addOrder = await Mesa.findByIdAndUpdate(query, {$push: {orders:orden}})
//     }
//     resolve("done")
//   })
// }

//Add Comanda
// module.exports.addComanda = (comanda, callback) => {
//   Comanda.create(comanda, callback);
//   // Comanda.create(comanda).then(async(comandaCr)=>{
//   //   let query = {_id:comanda.mesa}

//   //    const addOrder = await addingOrder(query, comandaCr)

//   //   callback()

//   // });
// };

// //Update Comanda
// module.exports.updateComanda = (id, comanda, options, callback) => {
//   const query = { _id: id };
//   const update = {
//     enviado: comanda.enviado,
//     orders: comanda.orden,
//     mesa: comanda.mesa,
//     fechaorden: comanda.fechaorden,
//     mesa: comanda.mesa,
//     numeroMesa: comanda.numeroMesa,
//     recetas: comanda.receta,
//     empleado: comanda.empleado,
//     estado: comanda.estado
//   };
//   Comanda.findOneAndUpdate(query, update, options, callback);
// };

//Update Comanda
module.exports.updateComandaChange = (id, data, options, callback) => {
  const query = { _id: id };
  let mesa = data.mesa;
  let numeroMesa = data.numeroMesa;
  Comanda.findOneAndUpdate(
    query,
    { $set: { mesa: mesa, numeroMesa: numeroMesa } },
    options,
    callback
  );
};

module.exports.deleteComanda = (id, callback) => {
  const query = { _id: id };
  Comanda.deleteOne(query, callback);
};
