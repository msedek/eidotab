const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comandaCierreSchema = new Schema({
  enviado: Boolean,
  orders: [],
  nro_comanda: String,
  numeroMesa: String,
  estado: {
    type: String
  },
  fechaorden: {
    type: Date
  },
  mesa:[],
  empleado: []
});

const ComandaCierre = (module.exports = mongoose.model(
  "ComandaCierre",
  comandaCierreSchema
));

//Get ComandaCierres REST
module.exports.getComandaCierres = (callback, limit) => {
  ComandaCierre.find(callback)
    .populate("mesa")
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    })
    .limit(limit);
};

//Add ComandaCierre
module.exports.addComandaCierre = (comandaCierre, callback) => {
  ComandaCierre.create(comandaCierre, callback);
};

module.exports.deleteComandaCierre = (id, callback) => {
  const query = { _id: id };
  ComandaCierre.deleteOne(query, callback);
};
