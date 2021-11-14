const express = require("express");
const router = express.Router();

const Recargo = require("../models/recargo");

//metodo GET
router.get("/api/recargos", (req, res) => {
  Recargo.find().then(recargos => {
    res.json(recargos);
  });
});

//metodo PUT
router.put("/api/recargos/:_id", (req, res) => {
  const id = req.params._id;
  Recargo.findOneAndUpdate({ _id: id }).then(recargo => {
    recargo.estado = !recargo.estado;
    recargo.save();
    res.json(recargo);
  });
});

router.post("/api/recargos", async (req, res) => {
  const recargo = await Recargo.create(req.body);
  res.json(recargo);
});

module.exports = router;
