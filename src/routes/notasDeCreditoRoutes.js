const express = require("express");
const router = express.Router();

const Credito = require("../models/notasDeCredito");
const Documento = require("../models/documento");

//metodo GET
router.get("/api/notasdecredito", async (req, res) => {
  const credito = await Credito.find();
  res.json(credito);
});

//metodo POST
router.post("/api/notasdecredito/:_id", async (req, res) => {
  const docuId = req.params._id;
  await Credito.create(req.body);
  let doc = await Documento.findByIdAndUpdate(
    { _id: docuId },
    { $set: { hasNdc: true } },
    { new: true }
  );
  res.json(doc);
});

module.exports = router;
