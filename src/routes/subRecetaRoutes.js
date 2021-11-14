const express = require("express");
const router = express.Router();

const SubReceta = require("../models/subReceta");

//metodo GET
router.get("/api/subrecetas", (req, res) => {
  SubReceta.getSubRecetas((err, subrecetas) => {
    if (err) {
      throw err;
    }
    res.json(subrecetas);
  });
});

router.get("/api/subrecetas/:_id", (req, res) => {
  SubReceta.getSubRecetaById(req.params._id, (err, subReceta) => {
    if (err) {
      throw err;
    }
    res.json(subReceta);
  });
});

//metodo POST
router.post("/api/subrecetas", (req, res) => {
  const subReceta = req.body;
  SubReceta.addSubReceta(subReceta, (err, subReceta) => {
    if (err) {
      throw err;
    }
    res.json(subReceta);
  });
});

//metodo PUT
router.put("/api/subrecetas/:_id", (req, res) => {
  const id = req.params._id;
  const subReceta = req.body;
  SubReceta.updateSubReceta(id, subReceta, {}, (err, subReceta) => {
    if (err) {
      throw err;
    }
    res.json(subReceta);
  });
});

//metodo DELETE
router.delete("/api/subrecetas/:_id", (req, res) => {
  const id = req.params._id;
  SubReceta.deleteSubReceta(id, (err, subReceta) => {
    if (err) {
      throw err;
    }
    res.json(subReceta);
  });
});

module.exports = router;
