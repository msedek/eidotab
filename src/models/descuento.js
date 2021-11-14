const mongoose = require("mongoose");

const descuentoSchema = mongoose.Schema({
  descuento: String,
  porcentaje: String,
  maximo: String
});

const Descuentos = (module.exports = mongoose.model(
  "Descuentos",
  descuentoSchema
));

//Get Descuentoss
module.exports.getDescuentos = (callback, limit) => {
  Descuentos.find(callback).limit(limit);
};

// //Get Descuentos
// module.exports.getDescuentoById = (id, callback) => {
//   Descuentos.findById(id, callback);
// };

//Add Descuentos
module.exports.addDescuento = (descuento, callback) => {
  Descuentos.create(descuento, callback);
};

// //Update Descuentos
// module.exports.updateDescuento = (id, descuento, options, callback) => {
//   const query = { _id: id };
//   const update = {
//     nombre: descuento.nombre,
//     ruc: descuento.ruc,
//     direccionFiscal: descuento.direccionFiscal,
//     sucursal: descuento.sucursal,
//     fecha_creacion: descuento.fecha_creacion,
//     direccionFisica: descuento.direccionFisica,
//     paginaWeb: descuento.paginaWeb,
//     centrosDeCosto: descuento.centrosDeCosto,
//     logo: descuento.logo
//   };
//   Descuentos.findOneAndUpdate(query, update, options, callback);
// };

//Delete Descuentos
module.exports.deleteDescuento = (id, callback) => {
  const query = { _id: id };
  Descuentos.deleteOne(query, callback);
};
