const express = require("express");
const router = express.Router();

const Cierre = require("../models/cierre");

//metodo GET
router.get("/api/cierres", (req, res) => {
  Cierre.getCierres((err, cierres) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.json({ sms: "Ocurrio un error al tratar de obtener los cierres" });
    }
    res.json(cierres);
  });
});

router.get("/api/cierres/:_id", (req, res) => {
  Cierre.findById(req.params._id)
    .populate("fondo")
    .populate({
      path: "empleado",
      populate: {
        path: "mensajes"
      }
    })
    .then((cierre, err) => {
      if (err) {
        console.log(err);
        res.status(500);
        res.json({ sms: "Ocurrio un error al tratar de obtener el cierre" });
      }
      res.json(cierre);
    });
});

//metodo POST
router.post("/api/cierres", (req, res) => {
  const cierre = req.body;
  Cierre.addCierre(cierre, (err, cierre) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.json({ sms: "Ocurrio un error al tratar de crear el cierre" });
    }
    res.json(cierre);
  });
});

module.exports = router;
