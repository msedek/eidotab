const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Mensaje = require("./mensaje");

//Empleado Schema
const empleadoSchema = mongoose.Schema({
  contact_id: { type: String, default: "" },
  contact_name: { type: String, default: "" },
  customer_name: { type: String, default: "" },
  vendor_name: { type: String, default: "" },
  cf_ruc_cliente: { type: String, default: "" },
  cf_dni_cliente: { type: String, default: "" },
  company_name: { type: String, default: "" },
  contact_type: { type: String, default: "" },
  contact_type_formatted: { type: String, default: "" },
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  email: { type: String, default: "" },
  cf_direccion_cliente: { type: String, default: "" },
  cf_empleado: { type: Boolean, default: false },
  cf_cargo: { type: String, default: "" },
  cf_clave_de_usuario: { type: String, default: "" },
  logged: { type: Boolean, default: false },
  horaEntrada: { type: String, default: "" },
  horaSalida: { type: String, default: "" },
  fondoId: { type: String, default: "" },
  mensajes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mensaje" }]

  // mesasAtendidas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mesa" }]
  //TODO MESAS ASIGANADAS PARA COCINA Y EIDOTAB MESA
});

const Empleado = (module.exports = mongoose.model("Empleado", empleadoSchema));

//Get Empleados
module.exports.getEmpleados = (callback, limit) => {
  Empleado.find(callback)
    .populate("mensajes")
    .limit(limit);
};

//Add Empleado
module.exports.addEmpleado = (empleado, callback) => {
  Empleado.create(empleado, callback);
};

//Get Empleado
module.exports.getEmpleadoById = (id, callback) => {
  Empleado.find({ cf_dni_cliente: id }, callback).populate("mensajes");
};

//Get Empleado
// module.exports.getEmpleadoByIdComanda = (id, callback) => {
//   Empleado.findById(id, callback);
// };

// //Update Empleado
module.exports.logOutEmpleado = (data, options, callback) => {
  const io = data.req.app.get("socketio");
  const date = moment()
    .tz("America/Lima")
    .format("HH:mm:ss");

  Empleado.findOne({ _id: data.id })
    .populate("mensajes")
    .then(empleado => {
      empleado.logged = false;
      empleado.horaSalida = date;
      empleado.fondoId = "";

      // for (let i = 0; i < empleado.mensajes.length; i++) {
      //   const mensaje = empleado.mensajes[i];
      //   await Mensaje.deleteOne({ _id: mensaje._id }).exec();
      // }

      // empleado.mensajes = [];
      empleado.save(callback);
      if (empleado.cf_cargo === "CAJERO") io.emit("closeShift");
    });
};

module.exports.updateEmpleadoSms = (id, smsId, options, callback) => {
  const query = { _id: id };
  Empleado.findOneAndUpdate(
    query,
    { $push: { mensajes: smsId } },
    options,
    callback
  );
};

module.exports.longOutEmpleado = (id, options, callback) => {
  const query = { _id: id };
  const date = moment(data.fechaorden).format("lll");
  Empleado.findOneAndUpdate(
    query,
    { $set: { logged: false, horaSalida: date } },
    options,
    callback
  );
};

//CONSIDERAR ENTRADAS Y SALIDAS PARA HISTORICO NO ES TRANSACCIONAL
