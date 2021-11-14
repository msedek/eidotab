const mongoose = require("mongoose");

// const impuestoSchema = mongoose.Schema({
//   codImpuesto: String,
//   tasaImpuesto: Number,
//   montoImpuesto: Number
// });

// const destalleSchema = mongoose.Schema({
//   codItem: String,
//   tasaIgv: Number,
//   montoIgv: Number,
//   montoItem: Number,
//   nombreItem: String,
//   precioItem: Number,
//   idOperacion: String,
//   cantidadItem: Number,
//   descuentoMonto: Number,
//   codAfectacionIgv: String,
//   precioItemSinIgv: Number,
//   unidadMedidaItem: String
// });

// const subDocumentoSchema = mongoose.Schema({
//   serie: String,
//   mntExe: Number,
//   mntExo: Number,
//   mntNeto: Number,
//   mntTotal: Number,
//   tipoMoneda: String,
//   correlativo: Number,
//   mntTotalIgv: Number,
//   mntTotalIsc: Number,
//   nombreEmisor: String,
//   numDocEmisor: String,
//   tipoDocEmisor: String,
//   glosaDocumento: String,
//   nombreReceptor: String,
//   numDocReceptor: String,
//   tipoDocReceptor: String,
//   direccionDestino: String,
//   fechaVencimiento: String
// });

// const descuentoSchema = mongoose.Schema({
//   mntTotalDescuentos: Number
// });

//Reenvio Schema
const reenvioSchema = mongoose.Schema({
  detalle: [],
  impuesto: [],
  descuento: {},
  documento: {},
  fechaEmision: String,
  idTransaccion: String,
  tipoDocumento: String,
  correoReceptor: String,
  dataPago: {}
});

const Reenvio = (module.exports = mongoose.model("Reenvio", reenvioSchema));

//Get Reenvios
module.exports.getReenvios = (callback, limit) => {
  Reenvio.find(callback).limit(limit);
};

// //Get Reenvio
// module.exports.getDocumentoById = (id, callback) => {
//   Reenvio.findById(id, callback);
// };

//Add Reenvio
// module.exports.addReenvio = (documento, callback) => {
//   Reenvio.create(documento, callback);
// };

// //Update Reenvio
// module.exports.updateDocumento = (id, documento, options, callback) => {
//   const query = { _id: id };
//   const update = {
//     detalle: documento.detalle,
//     impuesto: documento.impuesto,
//     descuento: documento.descuento,
//     documento: documento.documento,
//     fechaEmision: documento.fechaEmision,
//     idTransaccion: documento.idTransaccion,
//     tipoDocumento: documento.tipoDocumento
//   };
//   Reenvio.findOneAndUpdate(query, update, options, callback);
// };

//Delete Reenvio
module.exports.deleteReenvio = (id, callback) => {
  const query = { _id: id };
  Reenvio.deleteOne(query, callback);
};
