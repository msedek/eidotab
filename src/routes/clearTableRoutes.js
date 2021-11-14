const express = require("express");
const router = express.Router();

const Mesa = require("../models/mesa");

router.put("/api/cleartable/:_id", (req, res) => {
  const table = req.params._id;
  let data={
    table : table,
    req:req
  }
  Mesa.clearTable(data, {}, (err, respData) => {
    if (err) {
      throw err;
    }
    res.json(respData);
  });
});

router.put("/api/updatestate/:_id", async (req, res) => {
  const table = req.params._id;
  const io = req.app.get("socketio");
  const updateState = await Mesa.findOne({ _id: table })
    .populate({
      path: "empleados",
      populate: {
        path: "mensajes"
      }
    })
    .then(myMesa => {
      if (myMesa.estado !== "Master") myMesa.estado = "Por Pagar";
      myMesa.save();
      io.emit("updateMesa", myMesa);
    });
  res.json(updateState);
});

module.exports = router;
