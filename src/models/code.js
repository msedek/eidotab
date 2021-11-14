const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const codeSchema = new Schema({
  code: String,
  empleado: { type: Schema.Types.ObjectId, ref: "Empleado" },
  contact_id: String
});

const Code = (module.exports = mongoose.model("Code", codeSchema));

//Get Code
module.exports.getCodes = (callback, limit) => {
  Code.find(callback)
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    })
    .limit(limit);
};

module.exports.findCode = (code, callback, limit) => {
  Code.find({ code: code },callback)
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    })
    .limit(limit);
};

//Add Code
module.exports.addCode = (code, callback) => {
  Code.create(code, callback);
};

//Delete Code
module.exports.deleteCode = (id, callback) => {
  const query = { _id: id };
  Code.deleteOne(query, callback);
};
