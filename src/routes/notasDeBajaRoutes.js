const express = require("express");
const router = express.Router();

const Baja = require("../models/notasDeBaja");
const Code = require("../models/code");
const Justy = require("../models/justy");
const Documento = require("../models/documento");

//metodo GET
router.get("/api/notabaja", async (req, res) => {
  const bajas = await Baja.find();
  res.json(bajas);
});

//metodo POST
router.post("/api/notabaja/:_id", (req, res) => {
  const docId = req.params._id;
  console.log(docId)
  Baja.create(req.body).then(baja => {
    res.json(baja);
  });
  Documento.findByIdAndUpdate({ _id: docId }, { $set: { hasNdc: true } }).exec();
});

const codeFinder = code => {
  return new Promise((resolve, reject) => {
    Code.findCode(code, (err, code) => {
      if (err) {
        console.log(err);
      }
      if (code.length > 0) {
        resolve(code);
      } else {
        resolve("not found");
      }
    });
  });
};

const reasonFinder = justy => {
  return new Promise((resolve, reject) => {
    Justy.findJusty(justy, (err, justy) => {
      if (err) {
        console.log(err);
      }
      if (justy.length > 0) {
        resolve(justy);
      } else {
        resolve("not found");
      }
    });
  });
};

router.post("/api/valuser", async (req, res) => {
  const code = req.body.code;
  const validateCode = await codeFinder(code).catch(err => console.log(err));
  if (validateCode) {
    if (validateCode !== "not found") {
      res.json({ sms: "code found" });
    } else {
      res.status(401);
      res.json({ sms: "Codigo invalido" });
    }
  } else {
    res.status(500);
    res.json({ sms: "error interno" });
  }
});

router.post("/api/valcode", async (req, res) => {
  const justy = req.body.justy;
  const validateReason = await reasonFinder(justy).catch(err =>
    console.log(err)
  );
  if (validateReason) {
    if (validateReason !== "not found") {
      res.json({ sms: "reason found" });
    } else {
      res.status(401);
      res.json({ sms: "Razon invalida" });
    }
  } else {
    res.status(500);
    res.json({ sms: "error interno" });
  }
});

module.exports = router;
