const mongoose = require("mongoose");

const centroDeCostoSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  codigo: {
    type: String,
    required: true
  },
  empleados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Empleado" }],
  insumos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Insumo" }],
  subRecetas: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubReceta" }]
});

const CentroDeCosto = (module.exports = mongoose.model(
  "CentroDeCosto",
  centroDeCostoSchema
));

//Get CentroDeCostos
module.exports.getCentroDeCostos = (callback, limit) => {
  CentroDeCosto.find(callback)
    .populate("subRecetas")
    .populate("insumos")
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .limit(limit);
};

//Get CentroDeCosto
module.exports.getCentroDeCostoById = (id, callback) => {
  CentroDeCosto.findById(id, callback);
};

//Add CentroDeCosto
module.exports.addCentroDeCosto = (centroDeCosto, callback) => {
  CentroDeCosto.create(centroDeCosto, callback);
};

//Update CentroDeCosto
module.exports.updateCentroDeCosto = (id, centroDeCosto, options, callback) => {
  const query = { _id: id };
  const update = {
    nombre: centroDeCosto.nombre,
    codigo: centroDeCosto.codigo,
    insumos: centroDeCosto.insumos,
    subRecetas: centroDeCosto.subRecetas,
    empleados: centroDeCosto.empelados
  };
  CentroDeCosto.findOneAndUpdate(query, update, options, callback);
};

//Delete CentroDeCosto
module.exports.deleteCentroDeCosto = (id, callback) => {
  const query = { _id: id };
  CentroDeCosto.deleteOne(query, callback);
};
