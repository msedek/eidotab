const express = require("express");
const router = express.Router();

// const zohoMethods = require("../utils/zohoData");
// const zohoData = zohoMethods.zohoData;
// const clearRecipes = zohoMethods.zohoRecipes;

//metodo POST
router.post("/api/reloadzoho/", (req, res) => {
  clearRecipes()
  // zohoData();
  res.json("listo");
});

module.exports = router;
