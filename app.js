const menuaRoutes = require("./src/routes/menuaRoutes");
const comandaRoutes = require("./src/routes/comandaRoutes");
const historicoRoutes = require("./src/routes/historicoRoutes");
const mensajeRoutes = require("./src/routes/mensajeRoutes");
const empleadoRoutes = require("./src/routes/empleadoRoutes");
const insumoRoutes = require("./src/routes/insumoRoutes");
const documentoRoutes = require("./src/routes/documentoRoutes");
const mesaRoutes = require("./src/routes/mesaRoutes");
const correlativoRoutes = require("./src/routes/correlativoRoutes");
const recetaRoutes = require("./src/routes/recetaRoutes");
const recetaYachoRoutes = require("./src/routes/recetaYachoRoutes");
const empresaRoutes = require("./src/routes/empresaRoutes");
const centroCostoRoutes = require("./src/routes/centroCostoRoutes");
const subRecetaRoutes = require("./src/routes/subRecetaRoutes");
const marcharRoutes = require("./src/routes/marcharRoutes");
const cambiarMesaRoutes = require("./src/routes/cambiarMesaRoutes");
const clearTableRoutes = require("./src/routes/clearTableRoutes");
const reloadRoutes = require("./src/routes/reloadRoutes");
const pagoRoutes = require("./src/routes/pagoRoutes");
const descuentoRoutes = require("./src/routes/descuentoRoutes");
const fondoRoutes = require("./src/routes/fondoRoutes");
const cierreRoutes = require("./src/routes/cierreRoutes");
const reenvioRoutes = require("./src/routes/reenvioRoutes");
const tokenRoutes = require("./src/routes/tokenRoutes");
const notasDeBajaRoutes = require("./src/routes/notasDeBajaRoutes");
const notasDeCreditoRoutes = require("./src/routes/notasDeCreditoRoutes");
const recargoRoutes = require("./src/routes/recargoRoutes");
const socketActions = require("./src/socketio/socketActions");
const configs = require("./src/configs/configs");

const CONTROL_ZOHO = configs.controlZoho;

// const zohoData = require("./src/utils/zohoData");
// const zohoData = zohoRecetas.zohoData;

// const zohoContacs = require("./src/utils/zohoEmpleados");
// const zohoContactos = zohoContacs.zohoContactos;

const express = require("express");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIO = require("socket.io");
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);

app.set("socketio", io);
app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: true }));

app.use(menuaRoutes);
app.use(comandaRoutes);
app.use(historicoRoutes);
app.use(mensajeRoutes);
app.use(empleadoRoutes);
app.use(insumoRoutes);
app.use(documentoRoutes);
app.use(mesaRoutes);
app.use(correlativoRoutes);
app.use(recetaRoutes);
app.use(recetaYachoRoutes);
app.use(empresaRoutes);
app.use(centroCostoRoutes);
app.use(subRecetaRoutes);
app.use(marcharRoutes);
app.use(cambiarMesaRoutes);
app.use(clearTableRoutes);
app.use(reloadRoutes);
app.use(pagoRoutes);
app.use(descuentoRoutes);
app.use(fondoRoutes);
app.use(cierreRoutes);
app.use(reenvioRoutes);
app.use(tokenRoutes);
app.use(notasDeBajaRoutes);
app.use(notasDeCreditoRoutes);
app.use(recargoRoutes);
// app.use(zohoData.router);

// Connect to mongoose
mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);

const HOST = "localhost";
const PORT = 27017;
const DB = configs.db;

const uri = `mongodb://${HOST}:${PORT}/${DB}`;

mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.clear();
    console.log("connecting to database successful");

    server.listen(port, () => {
      console.log(`Running on port ${port}`);
    });

    //get data from zoho auto this process with a timer
    if (CONTROL_ZOHO) {
      // zohoData.delCon();
      // zohoData.getAllPages();
      // zohoContactos();
    }

    socketActions(io);
  })
  .catch(err => console.error("could not connect to mongo DB", err));
