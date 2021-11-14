const mongoose = require("mongoose");

const impuestoSchema = mongoose.Schema({
  codImpuesto: String,
  tasaImpuesto: Number,
  montoImpuesto: Number
});

const destalleSchema = mongoose.Schema({
  codItem: String,
  sku: String,
  tasaIgv: Number,
  montoIgv: Number,
  montoItem: Number,
  nombreItem: String,
  precioItem: Number,
  idOperacion: String,
  cantidadItem: Number,
  descuentoMonto: Number,
  codAfectacionIgv: String,
  precioItemSinIgv: Number,
  unidadMedidaItem: String
});

const subDocumentoSchema = mongoose.Schema({
  serie: String,
  mntExe: Number,
  mntExo: Number,
  mntNeto: Number,
  mntTotal: Number,
  tipoMoneda: String,
  correlativo: Number,
  mntTotalIgv: Number,
  mntTotalIsc: Number,
  mntTotalOtros: Number,
  nombreEmisor: String,
  numDocEmisor: String,
  tipoDocEmisor: String,
  glosaDocumento: String,
  nombreReceptor: String,
  numDocReceptor: String,
  tipoDocReceptor: String,
  direccionDestino: String,
  fechaVencimiento: String
});

const descuentoSchema = mongoose.Schema({
  mntTotalDescuentos: Number
});

//Documento Schema
const documentoSchema = mongoose.Schema({
  detalle: [destalleSchema],
  impuesto: [impuestoSchema],
  descuento: {
    type: descuentoSchema
  },
  documento: { type: subDocumentoSchema },
  fechaEmision: String,
  idTransaccion: {
    type: String,
    required: true,
    index: true
  },
  tipoDocumento: String,
  correoReceptor: String,
  zohoID: { type: String, default: "" },
  zohoPayment: { type: String, default: "" },
  hasNdc: {
    type: Boolean,
    default: false
  }
});

const Documento = (module.exports = mongoose.model(
  "Documento",
  documentoSchema
));

//Get Documentos
module.exports.getDocumentos = (callback, limit) => {
  Documento.find(callback).limit(limit);
};

//Get Documento
module.exports.getDocumentoById = (id, callback) => {
  Documento.findById(id, callback);
};

//Update Documento
module.exports.updateDocumento = (id, documento, options, callback) => {
  const query = { _id: id };
  const update = {
    detalle: documento.detalle,
    impuesto: documento.impuesto,
    descuento: documento.descuento,
    documento: documento.documento,
    fechaEmision: documento.fechaEmision,
    idTransaccion: documento.idTransaccion,
    tipoDocumento: documento.tipoDocumento
  };
  Documento.findOneAndUpdate(query, update, options, callback);
};

//Delete Documento
module.exports.deleteDocumento = (id, callback) => {
  const query = { _id: id };
  Documento.deleteOne(query, callback);
};
