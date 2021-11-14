const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");

const Empleado = require("../models/empleado");

//TODO CON EMPLEADOS
//metodo GET
router.get("/api/empleados", (req, res) => {
  Empleado.getEmpleados((err, empleados) => {
    if (err) {
      throw err;
    }
    res.json(empleados);
  });
});

router.get("/api/empleados/:_id", (req, res) => {
  Empleado.find({ cf_dni_cliente: req.params._id })
    .populate("mensajes")
    .then(empleado => {
      res.json(empleado);
    });
});

router.get("/api/fondoactivo", async (req, res) => {
  const emp = await  Empleado.find()
  res.json(emp)
});

//metodo POST
router.post("/api/empleados", (req, res) => {
  const empleado = req.body;
  Empleado.addEmpleado(empleado, (err, empleado) => {
    if (err) {
      throw err;
    }
    res.json(empleado);
  });
});

//metodo PUT
router.put("/api/logInEmpleado/:_id", (req, res) => {
  const date = moment().format("HH:mm:ss");
  const io = req.app.get("socketio");
  Empleado.findOne({ _id: req.params._id })
    .populate("mensajes")
    .then(async empleado => {
      if (empleado.cf_cargo === "CAJERO") {
        if (empleado.logged === false) {
          empleado.logged = true;
          empleado.horaEntrada = date;
          empleado.horaSalida = "";
          empleado.save();
          res.json(empleado);
        } else {
          res.json(empleado);
        }
      } else {
        let fondo = await Empleado.find().then(empleados => {
          for (let i = 0; i < empleados.length; i++) {
            const found = empleados[i];
            if (found.fondoId !== "" && found.cf_cargo === "CAJERO") {
              return found.fondoId;
            }
          }
        });
        if (fondo !== "" && fondo !== undefined) {
          if (empleado.logged === false) {
            empleado.fondoId = fondo;
            empleado.logged = true;
            empleado.horaEntrada = date;
            empleado.horaSalida = "";
            empleado.save();
            res.json(empleado);
            io.emit("logInMozo", empleado);
          } else {
            empleado.fondoId = fondo;
            empleado.save();
            res.json(empleado);
            io.emit("logInMozo", empleado);
          }
        } else {
          res.status(401);
          res.json({ sms: "CAJA NO DISPONIBLE" });
        }
      }
    });
});

//metodo PUT
router.put("/api/logOutEmpleado/:_id", (req, res) => {
  const id = req.params._id;
  const io = req.app.get("socketio");
  Empleado.logOutEmpleado({ id, req }, {}, (err, empleado) => {
    if (err) {
      throw err;
    }
    res.json(empleado);

    if (empleado.cf_cargo === "MOZO") io.emit("logOutMozo", empleado);
  });
});

//metodo DELETE
router.delete("/api/empleados/:_id", (req, res) => {
  const id = req.params._id;
  Empleado.deleteEmpleado(id, (err, empleado) => {
    if (err) {
      throw err;
    }
    res.json(empleado);
  });
});

module.exports = router;
