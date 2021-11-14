const express = require("express");
const router = express.Router();

const Descuento = require("../models/descuento");

//metodo GET
router.get("/api/descuentos", (req, res) => {
  Descuento.getDescuentos((err, descuentos) => {
    if (err) {
      throw err;
    }
    res.json(descuentos);
  });
});

// router.get("/api/descuentos/:_id", (req, res) => {
//   Descuento.getDescuentoById(req.params._id, (err, descuento) => {
//     if (err) {
//       throw err;
//     }
//     res.json(descuento);
//   });
// });

//metodo POST
router.post("/api/descuentos", (req, res) => {
  const descuento = req.body;
  Descuento.addDescuento(descuento, (err, descuento) => {
    if (err) {
      throw err;
    }
    res.json(descuento);
  });
});

// //metodo PUT
// router.put("/api/descuentos/:_id", (req, res) => {
//   const id = req.params._id;
//   const descuento = req.body;
//   Descuento.updateDescuento(id, descuento, {}, (err, descuento) => {
//     if (err) {
//       throw err;
//     }
//     res.json(descuento);
//   });
// });

//metodo DELETE
router.delete("/api/descuentos/:_id", (req, res) => {
  const id = req.params._id;
  Descuento.deleteDescuento(id, (err, descuento) => {
    if (err) {
      throw err;
    }
    res.json(descuento);
  });
});

module.exports = router;
