const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cierreSchema = mongoose.Schema({
  fondo: { type: Schema.Types.ObjectId, ref: "Fondo" },
  turno: {
    type: Date,
    default: Date.now
  },
  empleado: { type: Schema.Types.ObjectId, ref: "Empleado" },
  desvio: String
});

const Cierre = (module.exports = mongoose.model("Cierre", cierreSchema));

//Get Cierres
module.exports.getCierres = (callback, limit) => {
  Cierre.find(callback)
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    })
    .populate("fondo")
    .limit(limit);
};

//Add Cierre
module.exports.addCierre = (cierre, callback) => {
  Cierre.create(cierre, callback);
};