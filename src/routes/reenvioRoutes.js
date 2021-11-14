const express = require("express");
const router = express.Router();

const Reenvio = require("../models/reenvio");

//metodo GET
router.get("/api/reenvios", (req, res) => {
  Reenvio.getReenvios((err, reenvios) => {
    if (err) {
      throw err;
    }
    res.json(reenvios);
  });
});

router.get("/api/reenvios/:_id", (req, res) => {
  Reenvio.findById(req.params._id, (err, reenvio) => {
    if (err) {
      throw err;
    }
    res.json(reenvio);
  });
});

//metodo POST
router.post("/api/reenvios", (req, res) => {
  const reenvio = req.body;
  Reenvio.addReenvio(reenvio, (err, reenvio) => {
    if (err) {
      throw err;
    }
    res.json(reenvio);
  });
});

// //metodo PUT
// router.put("/api/reenvios/:_id", (req, res) => {
//   const id = req.params._id;
//   const reenvio = req.body;
//   Reenvio.updateReenvio(id, reenvio, {}, (err, reenvio) => {
//     if (err) {
//       throw err;
//     }
//     res.json(reenvio);
//   });
// });

//metodo DELETE
router.delete("/api/reenvios/:_id", (req, res) => {
  const id = req.params._id;
  Reenvio.deleteReenvio(id, (err, reenvio) => {
    if (err) {
      throw err;
    }
    res.json(reenvio);
  });
});

module.exports = router;
