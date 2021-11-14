const express = require("express");
const router = express.Router();

const Pago = require("../models/pago");

//metodo GET
router.get("/api/pagos", (req, res) => {
  Pago.getPagos((err, pagos) => {
    if (err) {
      throw err;
    }
    res.json(pagos);
  }); 
});

// router.get("/api/pagos/:_id", (req, res) => {
//   Pago.getPagoById(req.params._id, (err, pago) => {
//     if (err) {
//       throw err;
//     }
//     res.json(pago);
//   });
// });

//metodo POST
router.post("/api/pagos", (req, res) => {
  const pago = req.body;
  Pago.addPago(pago, (err, pago) => {
    if (err) {
      throw err;
    }
    res.json(pago);
  });
});

// //metodo PUT
// router.put("/api/pagos/:_id", (req, res) => {
//   const id = req.params._id;
//   const pago = req.body;
//   Pago.updatePago(id, pago, {}, (err, pago) => {
//     if (err) {
//       throw err;
//     }
//     res.json(pago);
//   });
// });

//metodo DELETE
router.delete("/api/pagos/:_id", (req, res) => {
  const id = req.params._id;
  Pago.deletePago(id, (err, pago) => {
    if (err) {
      throw err;
    }
    res.json(pago);
  });
});

module.exports = router;
