const express = require("express");
const router = express.Router();

const Correlativo = require("../models/correlativo");

//metodo GET
router.get("/api/correlativos", (req, res) => {
  Correlativo.getCorrelativos((err, correlativos) => {
    if (err) {
      throw err;
    }
    res.json(correlativos);
  });
});

router.get("/api/correlativos/:_id", (req, res) => {
  Correlativo.getCorrelativoById(req.params._id, (err, correlativo) => {
    if (err) {
      throw err;
    }
    res.json(correlativo);
  });
});

//metodo POST
router.post("/api/correlativos", (req, res) => {
  const correlativo = req.body;
  Correlativo.addCorrelativo(correlativo, (err, correlativo) => {
    if (err) {
      throw err;
    }
    res.json(correlativo);
  });
});

//metodo PUT
router.put("/api/correlativos/:_id", (req, res) => {
  const id = req.params._id;
  const correlaSerie = req.body.serieFactura.pop();
  Correlativo.updateCorrelativo(id, correlaSerie, {}, (err, correlativo) => {
    if (err) {
      throw err;
    }
    res.json(correlativo);
  });
});

//metodo DELETE
router.delete("/api/correlativos/:_id", (req, res) => {
  const id = req.params._id;
  Correlativo.deleteCorrelativo(id, (err, correlativo) => {
    if (err) {
      throw err;
    }
    res.json(correlativo);
  });
});

module.exports = router;
