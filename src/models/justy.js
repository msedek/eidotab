const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const justySchema = new Schema({
  justy: String,
  description: String
});

const Justy = (module.exports = mongoose.model("Justy", justySchema));

module.exports.getJusties = (callback, limit) => {
  Justy.find(callback).limit(limit);
};

//Get Justy
module.exports.findJusty = (justy, callback, limit) => {
  Justy.find({ justy: justy }, callback).limit(limit);
};

//Add Justy
module.exports.addJusty = (justy, callback) => {
  Justy.create(justy, callback);
};

//Delete Justy
module.exports.deleteJusty = (id, callback) => {
  const query = { _id: id };
  Justy.deleteOne(query, callback);
};
