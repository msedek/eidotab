const express = require("express");
const router = express.Router();

const CentroDeCosto = require("../models/centroDeCosto");

//metodo GET
router.get("/api/centroDeCostos", (req, res) => {
  CentroDeCosto.getCentroDeCostos((err, centroDeCostos) => {
    if (err) {
      throw err;
    }
    res.json(centroDeCostos);
  });
});

router.get("/api/centroDeCostos/:_id", (req, res) => {
  CentroDeCosto.getCentroDeCostoById(req.params._id, (err, centroDeCosto) => {
    if (err) {
      throw err;
    }
    res.json(centroDeCosto);
  });
});

//metodo POST
router.post("/api/centroDeCostos", (req, res) => {
  const centroDeCosto = req.body;
  CentroDeCosto.addCentroDeCosto(centroDeCosto, (err, centroDeCosto) => {
    if (err) {
      throw err;
    }
    res.json(centroDeCosto);
  });
});

//metodo PUT
router.put("/api/centroDeCostos/:_id", (req, res) => {
  const id = req.params._id;
  const centroDeCosto = req.body;
  CentroDeCosto.updateCentroDeCosto(
    id,
    centroDeCosto,
    {},
    (err, centroDeCosto) => {
      if (err) {
        throw err;
      }
      res.json(centroDeCosto);
    }
  );
});

//metodo DELETE
router.delete("/api/centroDeCostos/:_id", (req, res) => {
  const id = req.params._id;
  CentroDeCosto.deleteCentroDeCosto(id, (err, centroDeCosto) => {
    if (err) {
      throw err;
    }
    res.json(centroDeCosto);
  });
});

module.exports = router;
