const mongoose = require("mongoose");

//Menua Schema
const menuaSchema = mongoose.Schema({
  activo: {
    type: Number,
    default: 1
  }
});

const Menua = (module.exports = mongoose.model("Menua", menuaSchema));

//Get Menuas
module.exports.getMenuas = (callback, limit) => {
  Menua.find(callback).limit(limit);
};

//Update Menua
module.exports.updateMenua = (id, menua, options, callback) => {
  const query = { _id: id };
  const update = {
    activo: menua.activo
  };
  Menua.findOneAndUpdate(query, update, options, callback);
};
