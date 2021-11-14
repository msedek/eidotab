var mongoose = require("mongoose");

//Historico Schema
var historicoSchema = mongoose.Schema({
  mesa: {
    type: String
  },

  modificador: {
    type: String
  },

  nro_historico: {
    type: String
  },

  estado_orden: {
    type: String
  },

  //estado_bebida: {
  //type: String
  //},

  estado_pcuenta: {
    type: String
  },

  estado_pago: {
    type: String
  },

  foto_plato: {
    type: String
  },

  orden: {
    type: Array
  },

  fechaorden: {
    type: Date,
    default: Date.now
  }
});

var Historico = (module.exports = mongoose.model("Historico", historicoSchema));

//Get Historicos
module.exports.getHistoricos = function(callback, limit) {
  Historico.find(callback).limit(limit);
};

//Get Historico
module.exports.getHistoricoById = function(id, callback) {
  Historico.findById(id, callback);
};

//Add Historico
module.exports.addHistorico = function(historico, callback) {
  Historico.create(historico, callback);
};

//Update Historico
module.exports.updateHistorico = function(id, historico, options, callback) {
  var query = { _id: id };
  var update = {
    orden: historico.orden,
    mesa: historico.mesa,
    modificador: historico.modificador,
    fechaorden: historico.fechaorden,
    estado_orden: historico.estado_orden,
    //estado_bebida:historico.estado_bebida,
    estado_pcuenta: historico.estado_pcuenta,
    estado_pago: historico.estado_pago,
    foto_plato: historico.foto_plato,
    nro_historico: historico.nro_historico
  };
  Historico.findOneAndUpdate(query, update, options, callback);
};

//Update Estado Orden
module.exports.updateEstadoorden = function(id, historico, options, callback) {
  var query = { _id: id };
  var estado = historico.estado_orden;

  var set = { $set: {} };
  set.$set["estado_orden"] = estado;

  Historico.findOneAndUpdate(query, set, options, callback);
};

//Update Nro Historico
module.exports.updateNrohistorico = function(id, historico, options, callback) {
  var query = { _id: id };
  var nro_historico = historico.nro_historico;

  var set = { $set: {} };
  set.$set["nro_historico"] = nro_historico;

  Historico.findOneAndUpdate(query, set, options, callback);
};

//Update Estado platos
module.exports.updateEstados = function(id, historico, options, callback) {
  var query = { _id: id };
  //var catego = historico.categoria;
  var pos = historico.position;
  var estado = historico.estadoitem;

  var set = { $set: {} };
  set.$set["orden" + "." + pos + ".estadoitem"] = estado;

  Historico.findOneAndUpdate(query, set, options, callback);
};

//Update Orden
module.exports.updateOrdenes = function(id, historico, options, callback) {
  var query = { _id: id };
  var orden = historico.orden;

  var set = { $set: {} };
  set.$set["orden"] = orden;

  Historico.findOneAndUpdate(query, set, options, callback);
};

module.exports.deleteHistorico = function(id, callback) {
  var query = { _id: id };
  Historico.deleteOne(query, callback);
};
