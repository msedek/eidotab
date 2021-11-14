const express = require("express");
const router = express.Router();

const Receta = require("../models/receta");

//metodo GET
router.get("/api/recetas", (req, res) => {
  Receta.getRecetas((err, recetas) => {
    if (err) {
      throw err;
    }
    res.json(recetas);
  });
});

//metodo GET MOBILE
router.get("/api/recetasMobile", (req, res) => {
  Receta.getRecetas((err, recetas) => {
    if (err) {
      throw err;
    }

    let modRecetas = [];

    recetas.forEach(receta => {
      let nContorno = [];
      let nAdicionales = [];
      let nInsumos = [];
      let nSubrecetas = [];
      let modReceta = {};

      modReceta._id = receta._id;
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

      receta.adicionales.forEach(adic => {
        nAdicionales.push(adic.nombre);
      });

      receta.insumosData.forEach(ins => {
        nInsumos.push(ins.insumos.nombre);
      });

      receta.subRecetasData.forEach(sub => {
        nSubrecetas.push(sub.subRecetas.nombre);
      });

      modReceta.insumosData = nInsumos;
      modReceta.contorno = nContorno;
      modReceta.adicionales = nAdicionales;
      modRecetas.push(modReceta);
    });

    res.json(modRecetas);
  });
});

router.get("/api/recetas/:_id", (req, res) => {
  Receta.getRecetaById(req.params._id, (err, receta) => {
    if (err) {
      throw err;
    }
    res.json(receta);
  });
});

//metodo POST
router.post("/api/recetas", (req, res) => {
  const receta = req.body;
  Receta.addReceta(receta, (err, receta) => {
    if (err) {
      throw err;
    }
    res.json(receta);
  });
});

//metodo PUT
router.put("/api/recetas/:_id", (req, res) => {
  const id = req.params._id;
  const receta = req.body;
  Receta.updateReceta(id, receta, {}, (err, receta) => {
    if (err) {
      throw err;
    }
    res.json(receta);
  });
});

//metodo DELETE
router.delete("/api/recetas/:_id", (req, res) => {
  const id = req.params._id;
  Receta.deleteReceta(id, (err, receta) => {
    if (err) {
      throw err;
    }
    res.json(receta);
  });
});

module.exports = router;
