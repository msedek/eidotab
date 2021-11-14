const mongoose = require("mongoose");

//Correlativo Schema
const correlativoSchema = mongoose.Schema({
  serieFactura: {
    type: Array
  }
});

const Correlativo = (module.exports = mongoose.model(
  "Correlativo",
  correlativoSchema
));

//Get Correlativos
module.exports.getCorrelativos = (callback, limit) => {
  Correlativo.find(callback).limit(limit);
};

//Get Correlativo
module.exports.getCorrelativoById = (id, callback) => {
  Correlativo.findById(id, callback);
};

//Add Correlativo
module.exports.addCorrelativo = (correlativo, callback) => {
  Correlativo.create(correlativo, callback);
};

//Update Correlativo
module.exports.updateCorrelativo = (id, correlaSerie, options, callback) => {
  Correlativo.getCorrelativoById(id, (err, gotSerie) => {
    if (err) {
      throw err;
    }
    let serieFactura = gotSerie.serieFactura;
    for (let i = 0; i < serieFactura.length; i++) {
      let puntoDeVenta = serieFactura[i].split("-");
      if (correlaSerie.includes(puntoDeVenta[0])) {
        serieFactura.splice(i, 1);
        serieFactura.push(correlaSerie);
        break;
      }
    }
    let update = {
      serieFactura: serieFactura
    };
    Correlativo.findOneAndUpdate(id, update, options, callback);
  });
};

//Delete Correlativo
module.exports.deleteCorrelativo = (id, callback) => {
  const query = { _id: id };
  Correlativo.deleteOne(query, callback);
};
