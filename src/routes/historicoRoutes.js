const express = require("express");
const router = express.Router();

const Historico = require("../models/historico");

//TODO CON HISTORICO
//metodo GET
router.get("/api/historicos", (req, res) => {
  Historico.getHistoricos((err, historicos) => {
    if (err) {
      throw err;
    }
    res.json(historicos);
  });
});

router.get("/api/historico/:_id", (req, res) => {
  Historico.getHistoricoById(req.params._id, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo POST
router.post("/api/historicos", (req, res) => {
  const historico = req.body;
  Historico.addHistorico(historico, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo PUT
router.put("/api/historicos/:_id", (req, res) => {
  const id = req.params._id;
  const historico = req.body;
  Historico.updateHistorico(id, historico, {}, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo PUT ESTADO PLATOS
router.put("/api/estadoitems/:_id", (req, res) => {
  const id = req.params._id;
  const historico = req.body;

  Historico.updateEstados(id, historico, {}, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo PUT ESTADO ORDEN
router.put("/api/estadoorden/:_id", (req, res) => {
  const id = req.params._id;
  const historico = req.body;

  Historico.updateEstadoorden(id, historico, {}, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo PUT ESTADO NRO HISTORICO
router.put("/api/estadohistorico/:_id", (req, res) => {
  const id = req.params._id;
  const historico = req.body;

  Historico.updateNrohistorico(id, historico, {}, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo PUT ORDENES
router.put("/api/ordenes/:_id", (req, res) => {
  const id = req.params._id;
  const historico = req.body;
  Historico.updateOrdenes(id, historico, {}, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

//metodo DELETE
router.delete("/api/historicos/:_id", (req, res) => {
  const id = req.params._id;
  Historico.deleteHistorico(id, (err, historico) => {
    if (err) {
      throw err;
    }
    res.json(historico);
  });
});

module.exports = router;
