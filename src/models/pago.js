const mongoose = require("mongoose");

const pagoSchema = mongoose.Schema({
  pago: String
});

const Pago = (module.exports = mongoose.model("Pago", pagoSchema));

//Get Pagos
module.exports.getPagos = (callback, limit) => {
  Pago.find(callback).limit(limit);
};

//Add Pago
module.exports.addPago = (pago, callback) => {
  Pago.create(pago, callback);
};

//Delete Pago
module.exports.deletePago = (id, callback) => {
  const query = { _id: id };
  Pago.deleteOne(query, callback);
};
