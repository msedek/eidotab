const express = require("express");
const router = express.Router();

const Token = require("../models/token");

//metodo GET
router.get("/api/token", (req, res) => {
  Token.find()
    .then(token => {
      res.json(token);
    })
    .catch(err => {
      console.log(err);
      res.status(500);
      res.json({ sms: "error getting token" });
    });
});

//metodo POST
router.post("/api/token", (req, res) => {
  Token.find().then(tok => {
    if (tok.length === 0) {
      Token.create(req.body).then(theTok => {
        res.json(theTok);
      });
    } else {
      let theToken = tok.pop();
      Token.findOneAndUpdate(
        { _id: theToken._id },
        { $set: { token: req.body.token } },
        { new: true }
      ).then(theTok => {
        res.json(theTok);
      });
    }
  });
});

module.exports = router;
