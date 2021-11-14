const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const perdidaSchema = new Schema({
  merma: Boolean,
  code: { type: Schema.Types.ObjectId, ref: "Code" },
  justy: { type: Schema.Types.ObjectId, ref: "Justy" },
  item_id: String,
  receta:String
});

const Perdida = (module.exports = mongoose.model("Perdida", perdidaSchema));

//Get Perdida
module.exports.getPerdidas = (callback, limit) => {
  Perdida.find(callback)
    .populate({ path: "justy", populate: "description" })
    .populate({ path: "code", populate: { path: "empleado" } })
    .limit(limit);
};

// module.exports.findPerdida = (perdida, callback, limit) => {
//   Perdida.find({ perdida: perdida })
//     .populate("empleado")
//     .limit(limit);
// };

//Add Perdida
module.exports.addPerdida = (perdida, callback) => {
  Perdida.create(perdida, callback);
};

// //Delete Perdida
// module.exports.deletePerdida = (id, callback) => {
//   const query = { _id: id };
//   Perdida.deleteOne(query, callback);
// };
