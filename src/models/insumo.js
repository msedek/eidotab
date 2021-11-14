const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const configs = require("../configs/configs");
const COUNTER = configs.comandaCounter;

const connection = mongoose.createConnection(COUNTER);
autoIncrement.initialize(connection);
//Insumo Schema
const insumoSchema = mongoose.Schema({
  nombre: String,
  unidad: String,
  sku: String,
  msku: Number,
  reorder_level: {
    type: Number,
    default: 0
  },
  item_type: {
    type: Boolean,
    default: true
  },
  cf_familia: {
    type: String,
    default: "nada"
  },
  image_name: {
    type: String,
    default: "no data"
  },

  cf_subfamilia: {
    type: String,
    default: "nada"
  },
  cf_temperatura: {
    type: Array,
    default: []
  },
  inventory_account: String,
  purchase_description: String,
  purchase_account: String,
  purchase_price: Number,
  selling_price: Number,
  sales_account: String,
  marca: String,
  proveedor: String,
  tax_name: String,
  tax_percentage: Number,
  centro_de_costo: String,
  existence: {
    type: Number,
    default: 0
  },
  past_purchase_date: {
    type: String,
    default: "-"
  },
  // purchase_quantity: Number
});

insumoSchema.plugin(autoIncrement.plugin, {
  model: "Insumo",
  field: "msku"
});

const Insumo = (module.exports = mongoose.model("Insumo", insumoSchema));

// //Get Insumos
// module.exports.getInsumos = (callback, limit) => {
//   Insumo.find(callback)
//     .populate("centroDeCosto")
//     .limit(limit);
// };

// //Get Insumo
// module.exports.getInsumoById = (id, callback) => {
//   Insumo.findById(id, callback);
// };

// //Add Insumo
// module.exports.addInsumo = (insumo, callback) => {
//   Insumo.create(insumo, callback);
// };

// //Update Insumo
// module.exports.updateInsumo = (id, insumo, options, callback) => {
//   const query = { _id: id };
//   const update = {
//     nombre: insumo.nombre,
//     codigo: insumo.codigo,
//     codigoBarra: insumo.codigoBarra,
//     estado: insumo.estado,
//     unidad: insumo.unidad,
//     minimo: insumo.minimo,
//     optimo: insumo.optimo,
//     maximo: insumo.maximo,
//     critico: insumo.critico,
//     expira: insumo.expira,
//     cantidadComprada: insumo.cantidadComprada,
//     costo: insumo.costo
//   };
//   Insumo.findOneAndUpdate(query, update, options, callback);
// };

// //Delete Insumo
// module.exports.deleteInsumo = (id, callback) => {
//   const query = { _id: id };
//   Insumo.deleteOne(query, callback);
// };
