const mongoose = require("mongoose");

//Cliente Schema
const clienteSchema = mongoose.Schema({
  contact_id: { type: String, default: "" },
  contact_name: { type: String, default: "" },
  customer_name: { type: String, default: "" },
  cf_ruc_cliente: { type: String, default: "" },
  cf_dni_cliente: { type: String, default: "" },
  company_name: { type: String, default: "" },
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  email: { type: String, default: "" },
  cf_direccion_cliente: { type: String, default: "" }
});

const Cliente = (module.exports = mongoose.model("Cliente", clienteSchema));
