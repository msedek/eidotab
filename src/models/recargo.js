const mongoose = require("mongoose");

//Recargo Schema
const recargoSchema = mongoose.Schema({
  monto: Number,
  nombre: String,
  estado: Boolean
});

const Recargo = (module.exports = mongoose.model("Recargo", recargoSchema));
