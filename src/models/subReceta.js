const mongoose = require("mongoose");
// const deepPopulate = require('mongoose-deep-populate')(mongoose);

const subTypeSchema = mongoose.Schema({
  cantidad: String,
  unidad: String
});

const insumosSchema = mongoose.Schema({
  cantidad: String,
  unidad: String,
  insumos: { type: mongoose.Schema.Types.ObjectId, ref: "Insumo" }
});

//SubReceta Schema
const subRecetaSchema = mongoose.Schema({
  nombre: String,
  unidad: String,
  minimo: String,
  optimo: String,
  maximo: String,
  critico: String,
  expira: String,
  precio: String,
  cantInventario: String,
  esAdic: {
    type: Boolean,
    default: false
  },
  estado: {
    type: Boolean,
    default: true
  },
  insumosData: [insumosSchema],
  acompanante: { type: subTypeSchema },
  adicional: { type: subTypeSchema },
  centroDeCosto: { type: mongoose.Schema.Types.ObjectId, ref: "CentroDeCosto" }
});

const SubReceta = (module.exports = mongoose.model(
  "SubReceta",
  subRecetaSchema
));

//Get Recetas
module.exports.getSubRecetas = (callback, limit) => {
  SubReceta.find(callback)
    .populate("insumosData.insumos")
    .populate("centroDeCosto")
    .limit(limit);
};

//Get SubReceta
module.exports.getSubRecetaById = (id, callback) => {
  SubReceta.findById(id, callback);
};

//Add SubReceta
module.exports.addSubReceta = (subReceta, callback) => {
  SubReceta.create(subReceta, callback);
};

//Update SubReceta
module.exports.updateSubReceta = (id, subReceta, options, callback) => {
  const query = { _id: id };
  const update = {
    nombre: subReceta.nombre,
    insumosData: subReceta.insumosData,
    estado: subReceta.estado,
    plato: subReceta.plato,
    minimo: subReceta.minimo,
    optimo: subReceta.optimo,
    maximo: subReceta.maximo,
    critico: subReceta.critico,
    expira: subReceta.expira,
    precio: subReceta.precio,
    acompanante: subReceta.acompanante,
    adicional: subReceta.adicional,
    cantInventario: subReceta.cantInventario,
    esAdic: subReceta.esAdic,
    centroDeCosto: subReceta.centroDeCosto
  };
  SubReceta.findOneAndUpdate(query, update, options, callback);
};

//Delete SubReceta
module.exports.deleteSubReceta = (id, callback) => {
  const query = { _id: id };
  SubReceta.deleteOne(query, callback);
};
