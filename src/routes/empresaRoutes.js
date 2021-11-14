const express = require("express");
const router = express.Router();

const Empresa = require("../models/empresa");

//metodo GET
router.get("/api/empresas", (req, res) => {
  Empresa.getEmpresas((err, empresas) => {
    if (err) {
      throw err;
    }
    res.json(empresas);
  });
});

router.get("/api/empresas/:_id", (req, res) => {
  Empresa.getEmpresaById(req.params._id, (err, empresa) => {
    if (err) {
      throw err;
    }
    res.json(empresa);
  });
});

//metodo POST
router.post("/api/empresas", (req, res) => {
  const empresa = req.body;
  Empresa.addEmpresa(empresa, (err, empresa) => {
    if (err) {
      throw err;
    }
    res.json(empresa);
  });
});

//metodo PUT
router.put("/api/empresas/:_id", (req, res) => {
  const id = req.params._id;
  const empresa = req.body;
  Empresa.updateEmpresa(id, empresa, {}, (err, empresa) => {
    if (err) {
      throw err;
    }
    res.json(empresa);
  });
});

//metodo DELETE
router.delete("/api/empresas/:_id", (req, res) => {
  const id = req.params._id;
  Empresa.deleteEmpresa(id, (err, empresa) => {
    if (err) {
      throw err;
    }
    res.json(empresa);
  });
});

module.exports = router;
