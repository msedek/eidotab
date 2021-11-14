const mongoose = require("mongoose");

//Baja Schema
const bajaSchema = mongoose.Schema({
  notaBaja:{}
});

const Baja = (module.exports = mongoose.model("Baja", bajaSchema));

