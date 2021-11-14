const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  token: String
});

const Token = (module.exports = mongoose.model("Token", tokenSchema));
