const express = require("express");
const router = express.Router();
const lo = require("lodash");
const _ = require("underscore");

const Mensaje = require("../models/mensaje");
const Empleado = require("../models/empleado");

//metodo GET
router.get("/api/mensajes", (req, res) => {
  Mensaje.getMensajes((err, mensajes) => {
    if (err) {
      throw err;
    }
    res.json(mensajes);
  });
});

//metodo POST
router.post("/api/mensajes", async (req, res) => {
  const mensaje = req.body;
  const empId = mensaje.empleado;
  const io = req.app.get("socketio");
  const sms = await Mensaje.create(mensaje);

  Empleado.findOne({ _id: empId }).then(emp => {
    const sendEmp = lo.cloneDeep(emp);
    sendEmp.mensajes = [sms];
    emp.mensajes.push(sms);
    io.emit("sendSMS", sendEmp);
    emp.save();
    res.json(sms);
  });
});

//metodo PUT
router.put("/api/mensajes/:_id", (req, res) => {
  const id = req.params._id;
  const mensaje = req.body;
  Mensaje.updateMensaje(id, mensaje, {}, (err, mensaje) => {
    if (err) {
      throw err;
    }
    res.json(mensaje);
  });
});

//metodo DELETE
router.delete("/api/mensajes/:_id", async (req, res) => {
  const matrix = req.params._id.split("-");
  const id = matrix[0];
  const empId = matrix[1];
  const deleteSms = await Mensaje.findByIdAndDelete({ _id: id }).exec();
  res.json(deleteSms);

  Empleado.findOne({ _id: empId }).then(emp => {
    let mensajes = lo.cloneDeep(emp.mensajes);
    let borrar = mensajes.find(mensaje => {
      return mensaje.toString().trim() === id.toString().trim();
    });
    let clean = _.without(mensajes, borrar);
    emp.mensajes = clean;
    emp.save();
  });
});

module.exports = router;
