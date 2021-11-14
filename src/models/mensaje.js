const mongoose = require("mongoose");

//Mesanje Schema
const mensajeSchema = mongoose.Schema({
  remitente: String,
  texto: String,
  estadomensaje: String,
  fechamensaje: {
    type: Date,
    default: Date.now
  }
  // empleado: { type: mongoose.Schema.Types.ObjectId, ref: "Empleado" }
});

const Mensaje = (module.exports = mongoose.model("Mensaje", mensajeSchema));

//Get Mensajes
module.exports.getMensajes = (callback, limit) => {
  Mensaje.find(callback)
    // .populate("empleado")
    .limit(limit);
};

// //Get MensajeById
// module.exports.getMensajeByIdSocket = (id, callback) => {
//   Mensaje.find({ empleado: id }, callback).populate("empleado");
// };


//Add Mensaje
module.exports.addMensaje = (mensaje, callback) => {
  Mensaje.create(mensaje, callback);
};

//Update Mensaje
module.exports.updateMensaje = (id, mensaje, options, callback) => {
  const query = { _id: id };
  const update = {
    remitente: mensaje.remitente,
    texto: mensaje.texto,
    estadomensaje: mensaje.estadomensaje,
    fechamensaje: mensaje.fechamensaje,
    empleado: mensaje.empleado
  };
  Mensaje.findOneAndUpdate(query, update, options, callback);
};

//Delete Mensaje
module.exports.deleteMensaje = (id, callback) => {
  const query = { _id: id };
  Mensaje.deleteOne(query, callback);
};
