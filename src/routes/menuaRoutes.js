const express = require("express");
const router = express.Router();

const Menua = require("../models/menua");

//metodo GET
router.get("/api/menues", (req, res) => {
  Menua.getMenuas((err, menuas) => {
    if (err) {
      throw err;
    }
    res.json(menuas);
  });
});

//metodo PUT
router.put("/api/menues/:_id", (req, res) => {
  const id = req.params._id;
  const menua = req.body;
  Menua.updateMenua(id, menua, {}, (err, menua) => {
    if (err) {
      throw err;
    }
    res.json(menua);
  });
});

module.exports = router;
