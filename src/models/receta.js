const mongoose = require("mongoose");

//Receta Schema
const recetaSchema = mongoose.Schema({
  item_id: String,
  tax_id: String,
  tax_name: String,
  tax_percentage: String,
  cf_cant_guarnicion: Number,
  sku: String,
  nombre: String,
  estado: {
    type: Boolean,
    default: true
  },
  categoria_receta: String,
  descripcion: String,
  precio_receta: Number,
  foto_movil: String,
  sub_categoria_receta: String,
  contorno: [],
  ingredientes: [],
  cf_temperatura: [],
  cf_cocci_n: [],
  endulzante: [],
  cf_lacteos: []
});

const Receta = (module.exports = mongoose.model("Receta", recetaSchema));

//Get Recetas
module.exports.getRecetas = (callback, limit) => {
  Receta.find(callback)
    .populate("contorno")
    .limit(limit);
};

//Get Receta
module.exports.getRecetaById = (id, callback) => {
  Receta.findById(id, callback)
    .populate("contorno")
};

//Add Receta
module.exports.addReceta = (receta, callback) => {
  Receta.create(receta, callback);
};

//Update Receta
module.exports.updateReceta = (id, receta, options, callback) => {
  const query = { _id: id };
  const update = {
    nombre: receta.nombre,
    insumosData: receta.insumosData,
    estado: receta.estado,
    plato: receta.plato,
    subRecetasData: receta.subRecetasData,
    categoria_receta: receta.categoria_receta,
    descripcion: receta.descripcion,
    precio_receta: receta.precio_receta,
    foto_movil: receta.foto_movil,
    idioma: receta.idioma,
    activo: receta.activo,
    sugerencia: receta.sugerencia,
    fecha_creacion: receta.fecha_creacion,
    sub_categoria_receta: receta.sub_categoria_receta,
    contorno: receta.contorno
  };
  Receta.findOneAndUpdate(query, update, options, callback);
};

//Delete Receta
module.exports.deleteReceta = (id, callback) => {
  const query = { _id: id };
  Receta.deleteOne(query, callback);
};
