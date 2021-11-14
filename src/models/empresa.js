const mongoose = require("mongoose");

const empresaSchema = mongoose.Schema({
  paginaWeb: String,
  nombre: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  ruc: {
    type: String,
    required: true
  },
  direccionFiscal: {
    type: String,
    required: true
  },
  sucursal: {
    type: String,
    required: true
  },
  direccionFisica: {
    type: String,
    required: true
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  centrosDeCosto: [
    { type: mongoose.Schema.Types.ObjectId, ref: "CentroDeCosto" }
  ]
});

const Empresa = (module.exports = mongoose.model("Empresa", empresaSchema));

//Get Empresas
module.exports.getEmpresas = (callback, limit) => {
  Empresa.find(callback)
    .populate("centrosDeCosto")
    .limit(limit);
};

//Get Empresa
module.exports.getEmpresaById = (id, callback) => {
  Empresa.findById(id, callback);
};

//Add Empresa
module.exports.addEmpresa = (empresa, callback) => {
  Empresa.create(empresa, callback);
};

//Update Empresa
module.exports.updateEmpresa = (id, empresa, options, callback) => {
  const query = { _id: id };
  const update = {
    nombre: empresa.nombre,
    ruc: empresa.ruc,
    direccionFiscal: empresa.direccionFiscal,
    sucursal: empresa.sucursal,
    fecha_creacion: empresa.fecha_creacion,
    direccionFisica: empresa.direccionFisica,
    paginaWeb: empresa.paginaWeb,
    centrosDeCosto: empresa.centrosDeCosto,
    logo: empresa.logo
  };
  Empresa.findOneAndUpdate(query, update, options, callback);
};

//Delete Empresa
module.exports.deleteEmpresa = (id, callback) => {
  const query = { _id: id };
  Empresa.deleteOne(query, callback);
};
