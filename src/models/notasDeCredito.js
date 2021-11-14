const mongoose = require("mongoose");

//Credito Schema
const creditoSchema = mongoose.Schema({
  notaCredito:{}
});

const Credito = (module.exports = mongoose.model("Credito", creditoSchema));