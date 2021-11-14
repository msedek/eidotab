const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const detallePagoSchema = mongoose.Schema({
  monto: Number,
  tipoPago: String,
  reference: String,
  orderDetails: [],
  date: {
    type: Date,
    default: Date.now
  }
});

const documentoSchema = mongoose.Schema({
  documento: {},
  dataPago: Array,
  empleado: String,
  ticketImpreso: Array
});

const detalleArqPagoSchema = mongoose.Schema({
  acumulado: {
    type: Number,
    default: 0
  },
  totalEfectivoLocal: {
    type: Number,
    default: 0
  },
  totalEfectivoDolar: {
    type: Number,
    default: 0
  },
  totalPosMaster: {
    type: Number,
    default: 0
  },
  totalPosVisa: {
    type: Number,
    default: 0
  },
  totalOtros: {
    type: Number,
    default: 0
  },
  operEfectivoLocal: {
    type: Number,
    default: 0
  },
  operEfectivoDolar: {
    type: Number,
    default: 0
  },
  operPosMaster: {
    type: Number,
    default: 0
  },
  operPosVisa: {
    type: Number,
    default: 0
  },
  operOtros: {
    type: Number,
    default: 0
  },
  totalEfectivoLocalArq: {
    type: Number,
    default: 0
  },
  totalEfectivoDolarArq: {
    type: Number,
    default: 0
  },
  totalPosMasterArq: {
    type: Number,
    default: 0
  },
  totalPosVisaArq: {
    type: Number,
    default: 0
  },
  totalOtrosArq: {
    type: Number,
    default: 0
  },
  arqMaster: {
    type: Array,
    default: []
  },
  arqVisa: {
    type: Array,
    default: []
  },
  arqOtros: {
    type: Array,
    default: []
  },
  arqMasterDiff: {
    type: Array,
    default: []
  },
  arqVisaDiff: {
    type: Array,
    default: []
  },
  arqOtrosDiff: {
    type: Array,
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const fondoSchema = mongoose.Schema({
  diezCentimosMoneda: {
    type: Number,
    default: 0
  },
  veinteCentimosMoneda: {
    type: Number,
    default: 0
  },
  cincuentaCentimosMoneda: {
    type: Number,
    default: 0
  },
  unSolMoneda: {
    type: Number,
    default: 0
  },
  dosSolesMoneda: {
    type: Number,
    default: 0
  },
  cincoSolesMoneda: {
    type: Number,
    default: 0
  },
  diezSolesBillete: {
    type: Number,
    default: 0
  },
  veinteSolesBillete: {
    type: Number,
    default: 0
  },
  cincuentaSolesBillete: {
    type: Number,
    default: 0
  },
  cienSolesBillete: {
    type: Number,
    default: 0
  },
  dosCientosSolesBillete: {
    type: Number,
    default: 0
  },
  vales: {
    type: Number,
    default: 0
  },
  totalFondo: Number,
  turno: {
    type: Date,
    default: Date.now
  },
  detalleAuto: [detallePagoSchema],
  detalleCierre: { type: detalleArqPagoSchema, default: {} },
  pax: { type: Number, default: 0 },
  documentos: [documentoSchema]
});

const Fondo = (module.exports = mongoose.model("Fondo", fondoSchema));

//Get Fondos
module.exports.getFondos = (callback, limit) => {
  Fondo.find(callback).limit(limit);
};

//Add Fondo
module.exports.addFondo = (fondo, callback) => {
  Fondo.create(fondo, callback);
};

//Delete Fondo
module.exports.deleteFondo = (id, callback) => {
  const query = { _id: id };
  Fondo.deleteOne(query, callback);
};
