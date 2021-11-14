const axios = require("axios");
const mongoose = require("mongoose");

const Empleado = require("../models/empleado");
const Cliente = require("../models/cliente");
const configs = require("../configs/configs");

const CONTROL_ZOHO = configs.controlZoho;
//--------------------------DBDROP-----------------------------------------------

// if (CONTROL_ZOHO) {
if (CONTROL_ZOHO) {
  mongoose.Promise = global.Promise;
  const HOST = "127.0.0.1";
  const PORT = 27017;
  const DB = configs.db;

  const config = {
    autoIndex: false,
    useNewUrlParser: true
  };

  const uri = `mongodb://${HOST}:${PORT}/${DB}`;

  mongoose.connect(
    uri,
    config
  );

  const conn = mongoose.createConnection(uri);
  conn.on("open", function() {
    conn.db.listCollections().toArray(function(err, collectionNames) {
      if (err) {
        reject(err);
      }
      let found = false;
      for (let i = 0; i < collectionNames.length; i++) {

        const collection = collectionNames[i].name;




        // if (collection.includes("empleados")) {
        //   mongoose.connection.collections["empleados"].drop(err => {
        //     if (err) {
        //       throw err;
        //     }
        //     found = true;
        //     console.log("Collection empleados Dropped");
        //   });
        //   conn.close();
        //   break;
        // }


        // if (collection.includes("clientes")) {
        //   mongoose.connection.collections["clientes"].drop(err => {
        //     if (err) {
        //       throw err;
        //     }
        //     found = true;
        //     console.log("Collection clientes Dropped");
        //   });
        //   conn.close();
        //   break;
        // }
      }
      if (!found) {
        console.log("No collection empleados to drop");
      }
    });
  });
}
//--------------------------DBDROP-----------------------------------------------

let page = 1; //pages from Zoho, Increment if hasMorePages
const pages = []; //pages from Zoho

let URL_CONTACTOS = `https://books.zoho.com/api/v3/contacts?authtoken=0385bb29884bb66db48e582ba63317f7&organization_id=640669816&filter_by=Status.Active&page=${page}&per_page=200`;
// let URL_CONTACT = `https://books.zoho.com/api/v3/contacts?authtoken=0385bb29884bb66db48e582ba63317f7&organization_id=640669816&filter_by=Status.Active&page=${page}&per_page=200`;

const getContactos = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(URL_CONTACTOS, {
        responseType: "json"
      })
      .then(response => {
        const hasMorePages = response.data.page_context.has_more_page;
        pages.push(response.data.contacts);
        // console.log(pages[0].items[0].name.toLowerCase());
        resolve(hasMorePages);
      })
      .catch(error => {
        reject(error); //dispatch error
      });
  });
};

exports.zohoContactos = getAllPages = async () => {
  const condition = await getContactos();
  if (condition) {
    page++;
    URL_CONTACTOS = `https://books.zoho.com/api/v3/contacts?authtoken=0385bb29884bb66db48e582ba63317f7&organization_id=640669816&filter_by=Status.Active&page=${page}&per_page=200`;
    getAllPages();
    console.log("contactos pages ", page);
  } else {
    let proveedores = [];
    let clientes = [];
    let empleados = [];
    for (let i = 0; i < pages.length; i++) {
      const pageBD = pages[i];
      for (let j = 0; j < pageBD.length; j++) {
        const tipoContacto = pageBD[j].contact_type;
        if (tipoContacto === "vendor") {
          const contacto = pageBD[j].cf_cargo;
          if (contacto !== undefined) {
            empleados.push(pageBD[j]);
          } else {
            proveedores.push(pageBD[j]);
          }
        } else {
          if (tipoContacto === "customer") {
            clientes.push(pageBD[j]);
          }
        }
      }
    }

    // for (let i = 0; i < empleados.length; i++) {
    //   const empleadoZoho = empleados[i];
    //   let empleado = {};

    //   empleado = empleadoZoho;
    //   empleado.contact_id = empleadoZoho.contact_id;
    //   empleado.contact_name = empleadoZoho.contact_name;
    //   empleado.customer_name = empleadoZoho.customer_name;
    //   empleado.vendor_name = empleadoZoho.vendor_name;
    //   empleado.cf_ruc_cliente = empleadoZoho.cf_ruc_cliente;
    //   empleado.cf_dni_cliente = empleadoZoho.cf_dni_cliente;
    //   empleado.cf_direccion_cliente = empleadoZoho.cf_direccion_cliente;
    //   empleado.company_name = empleadoZoho.company_name;
    //   empleado.contact_type = empleadoZoho.contact_type;
    //   empleado.contact_type_formatted = empleadoZoho.contact_type_formatted;
    //   empleado.first_name = empleadoZoho.first_name;
    //   empleado.last_name = empleadoZoho.last_name;
    //   empleado.email = empleadoZoho.email;
    //   empleado.cf_empleado = empleadoZoho.cf_empleado;
    //   empleado.cf_cargo = empleadoZoho.cf_cargo;
    //   empleado.cf_clave_de_usuario = empleadoZoho.cf_clave_de_usuario;
    //   empleado.horaEntrada = empleadoZoho.horaEntrada;
    //   empleado.horaSalida = empleadoZoho.horaSalida;

    //   await Empleado.create(empleado);
    // }

    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      await Cliente.create(cliente);
    }
  }
};
