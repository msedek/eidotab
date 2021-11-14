const express = require("express");
const _ = require("underscore");
const lo = require("lodash");
const router = express.Router();
const Insumo = require("../models/insumo");

//metodo GET
router.get("/api/insumos", (req, res) => {
  Insumo.find().then(insumos => {
    res.json(insumos);
  });
});

router.get("/api/insumos/:_id", async (req, res) => {
  const insumo = await Insumo.findById({ _id: req.params._id });
  res.json(insumo);
});

//metodo POST
router.post("/api/insumos", async (req, res) => {
  let supply = req.body;

  if (supply.cf_temperatura === "No") supply.cf_temperatura = [];

  supply = _.omit(supply, "_id");

  Insumo.create(supply).then(async supply => {
    supply.image_name = `${supply.msku}.jpg`;
    supply.sku = supply.msku;
    await supply.save();
    res.json(supply);
  });
});

//metodo PUT
router.put("/api/insumos/:_id", (req, res) => {
  Insumo.findOne({ _id: req.params._id }).then(insumo => {
    if (req.body.cf_temperatura === "No") {
      insumo.cf_temperatura = [];
    } else {
      insumo.cf_temperatura = req.body.cf_temperatura;
    }
    insumo.nombre = req.body.nombre;
    insumo.marca = req.body.marca;
    insumo.proveedor = req.body.proveedor;
    insumo.unidad = req.body.unidad;
    insumo.msku = req.body.msku;
    insumo.reorder_level = req.body.reorder_level;
    insumo.cf_familia = req.body.cf_familia;
    insumo.image_name = req.body.image_name;
    insumo.cf_subfamilia = req.body.cf_subfamilia;
    insumo.inventory_account = req.body.inventory_account;
    insumo.purchase_description = req.body.purchase_description;
    insumo.purchase_account = req.body.purchase_account;
    insumo.purchase_price = req.body.purchase_price;
    insumo.selling_price = req.body.selling_price;
    insumo.sales_account = req.body.sales_account;
    insumo.brand = req.body.brand;
    insumo.tax_name = req.body.tax_name;
    insumo.tax_percentage = req.body.tax_percentage;
    insumo.centro_de_costo = req.body.centro_de_costo;
    res.json(req.body);
    insumo.save();
  });
});

router.put("/api/compra/:_id", async (req, res) => {
  let insumo = await Insumo.findOneAndUpdate(
    { _id: req.params._id },
    {
      $set: {
        past_purchase_date: req.body.past_purchase_date,
        existence: req.body.existence
      }
    },
    { new: true }
  );
  res.json(insumo);
});

//metodo DELETE
router.delete("/api/insumos/:_id", async (req, res) => {
  await Insumo.findByIdAndRemove({ _id: req.params._id });
  res.json({ deleted: req.params._id });
});

module.exports = router;
