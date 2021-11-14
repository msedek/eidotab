const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const Schema = mongoose.Schema;
const configs = require("../configs/configs");
const COUNTER = configs.comandaCounter;

const connection = mongoose.createConnection(COUNTER);
autoIncrement.initialize(connection);
//RecetaYacho Schema

const insumoSchema = new Schema({
  id: { type: Schema.Types.ObjectId, ref: "Insumo" },
  cantidad: Number,
  unidad: String,
  recetaYacho: String
});

const insumoComplexSchema = new Schema({
  id: { type: Schema.Types.ObjectId, ref: "RecetaYacho" },
  cantidad: Number,
  unidad: String,
  recetaYacho: String
});

const recetaYachoSchema = new Schema({
  name: {
    type: String,
    default: "no data"
  },
  reorder_level: {
    type: Number,
    default: 0
  },
  cf_lacteos: {
    type: Array,
    default: []
  },
  endulzante: {
    type: Array,
    default: []
  },
  item_id: String,
  sku: String,
  isSupply: Boolean,
  isGuarni: Boolean,
  msku: Number,
  cf_familia: {
    type: String,
    default: "nada"
  },
  image_name: {
    type: String,
    default: "no data"
  },
  description: {
    type: String,
    default: "no info"
  },
  tax_id: {
    type: String,
    default: "nodata"
  },
  tax_name: {
    type: String,
    default: "no data"
  },
  tax_percentage: {
    type: String,
    default: "no data"
  },
  precio_receta: {
    type: Number,
    default: 0
  },
  cf_subfamilia: {
    type: String,
    default: "nada"
  },
  cf_temperatura: {
    type: Array,
    default: []
  },
  cf_cocci_n: {
    type: Array,
    default: []
  },
  cf_guarnicionLocal: [insumoComplexSchema],
  cf_guarnicion: [],
  cf_cant_guarnicion: {
    type: Number,
    default: 0
  },
  cf_ingredientesLocal: [insumoSchema],
  cf_ingredientes: []
});

recetaYachoSchema.plugin(autoIncrement.plugin, {
  model: "RecetaYacho",
  field: "msku"
});

const RecetaYacho = (module.exports = mongoose.model(
  "RecetaYacho",
  recetaYachoSchema
));

//Get Recetas
module.exports.getRecetas = (callback, limit) => {
  RecetaYacho.find(callback).limit(limit);
};

//Get Receta
module.exports.getRecetaById = (id, callback) => {
  RecetaYacho.findById(id, callback);
};

//Add Receta
module.exports.addReceta = (receta, callback) => {
  RecetaYacho.create(receta, callback);
};
