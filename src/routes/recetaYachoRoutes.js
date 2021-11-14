const express = require("express");
const router = express.Router();

const _ = require("underscore");
const Receta = require("../models/recetaYacho");
const configs = require("../configs/configs");
const controlZoho = configs.controlZoho;

//metodo GET
router.get("/api/recetasYacho", (req, res) => {
  Receta.getRecetas((err, recetas) => {
    if (err) {
      throw err;
    }
    res.json(recetas);
  });
});

//metodo GET MOBILE
router.get("/api/recetasMobileYacho", (req, res) => {
  Receta.getRecetas((err, recetas) => {
    if (err) {
      throw err;
    }

    let modRecetas = [];

    recetas.forEach(receta => {
      let nContorno = [];
      let nInsumos = [];
      let nSubrecetas = [];
      let modReceta = {};

      modReceta._id = receta._id;
      modReceta.item_id = receta.item_id;
      modReceta.nombre = receta.nombre;
      modReceta.estado = receta.estado;
      modReceta.plato = receta.plato;
      modReceta.categoria_receta = receta.categoria_receta;
      modReceta.descripcion = receta.descripcion;
      modReceta.precio_receta = receta.precio_receta;
      modReceta.foto_movil = receta.foto_movil;
      modReceta.idioma = receta.idioma;
      modReceta.activo = receta.activo;
      modReceta.sugerencia = modReceta.sugerencia;
      modReceta.fecha_creacion = receta.fecha_creacion;
      modReceta.sub_categoria_receta = receta.sub_categoria_receta;

      receta.contorno.forEach(cont => {
        nContorno.push(cont.nombre);
      });

      receta.insumosData.forEach(ins => {
        nInsumos.push(ins.insumos.nombre);
      });

      receta.subRecetasData.forEach(sub => {
        nSubrecetas.push(sub.subRecetas.nombre);
      });

      modReceta.insumosData = nInsumos;
      modReceta.contorno = nContorno;
      modRecetas.push(modReceta);
    });

    res.json(modRecetas);
  });
});

router.get("/api/recetasYacho/:_id", (req, res) => {
  Receta.getRecetaById(req.params._id, (err, receta) => {
    if (err) {
      throw err;
    }
    res.json(receta);
  });
});

//metodo POST HUAYACHO
router.post("/api/recetasYacho", (req, res) => {
  const receta = req.body;
  Receta.addReceta(receta, (err, receta) => {
    if (err) {
      throw err;
    }
    res.json(receta);
  });
});

//metodo POST NORMAL
router.post("/api/recipes", async (req, res) => {
  let recipe = req.body;

  recipe = _.omit(recipe, "_id");

  if (recipe.cf_lacteos === "No") recipe.cf_lacteos = [];
  if (recipe.cf_temperatura === "No") recipe.cf_temperatura = [];
  if (recipe.endulzante === "No") recipe.endulzante = [];
  if (recipe.cf_cocci_n === "No") recipe.cf_cocci_n = [];

  let newRecipe = await Receta.create(recipe);
  let frec = await Receta.findOneAndUpdate(
    { _id: newRecipe._id },
    {
      $set: {
        image_name: newRecipe.msku,
        item_id: newRecipe._id,
        sku: newRecipe.msku
      }
    },
    { new: true }
  );
  res.json(frec);
});

//metodo PUT
router.put("/api/recetasYacho/:_id", (req, res) => {
  Receta.findOne({ _id: req.params._id }).then(recipe => {
    if (req.body.cf_lacteos === "No") {
      recipe.cf_lacteos = [];
    } else {
      recipe.cf_lacteos = req.body.cf_lacteos;
    }
    if (req.body.endulzante === "No") {
      recipe.endulzante = [];
    } else {
      recipe.endulzante = req.body.endulzante;
    }
    if (req.body.cf_cocci_n === "No") {
      recipe.cf_cocci_n = [];
    } else {
      recipe.cf_cocci_n = req.body.cf_cocci_n;
    }
    if (req.body.cf_temperatura === "No") {
      recipe.cf_temperatura = [];
    } else {
      recipe.cf_temperatura = req.body.cf_temperatura;
    }
    recipe.name = req.body.name;
    recipe.reorder_level = req.body.reorder_level;
    recipe.isSupply = req.body.isSupply;
    recipe.isGuarni = req.body.isGuarni;
    recipe.cf_familia = req.body.cf_familia;
    recipe.description = req.body.description;
    recipe.tax_id = req.body.tax_id;
    recipe.tax_name = req.body.tax_name;
    recipe.tax_percentage = req.body.tax_percentage;
    recipe.precio_receta = req.body.precio_receta;
    recipe.cf_subfamilia = req.body.cf_subfamilia;
    recipe.cf_guarnicionLocal = req.body.cf_guarnicionLocal;
    recipe.cf_guarnicion = req.body.cf_guarnicion;
    recipe.cf_cant_guarnicion = req.body.cf_cant_guarnicion;
    recipe.cf_ingredientes = req.body.cf_ingredientes;
    recipe.cf_ingredientesLocal = req.body.cf_ingredientesLocal;
    res.json(req.body);
    recipe.save();
  });
});

//metodo DELETE
router.delete("/api/recetasYacho/:_id", async (req, res) => {
  await Receta.findByIdAndRemove({ _id: req.params._id });
  console.log(req.params._id);
  res.json({ deleted: req.params._id });
});

module.exports = router;
