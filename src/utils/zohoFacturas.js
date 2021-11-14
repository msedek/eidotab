const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const mongoose = require("mongoose");

const configs = require("../configs/configs");
const RecetaYacho = require("../models/recetaYacho");

const USER = configs.user;
const FOLDER = configs.folder;
const ownCloud = `/home/${USER}/${FOLDER}/`;

const CONTROL_ZOHO = configs.controlZoho;
//--------------------------DBDROP-----------------------------------------------

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
        if (collection.includes("recetayachos")) {
          mongoose.connection.collections["recetayachos"].drop(err => {
            if (err) {
              throw err;
            }
            found = true;
            console.log("Collection Dropped");
          });
          conn.close();
          break;
        }
      }
      if (!found) {
        console.log("No collection to drop");
      }
    });
  });
}
//--------------------------DBDROP-----------------------------------------------

let page = 1; //pages from Zoho, Increment if hasMorePages
const pages = []; //pages from Zoho
const guarniciones = []; //guarniciones from Zoho

const myItems = []; //TEST Get this from folder analisis
const recetas = []; //TEST Get this from folder analisis
// let hasMorePages = false; //Is there more pages in Zoho

const fileCollector = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(ownCloud, (err, files) => {
      if (err) {
        reject(err);
      }
      files.forEach(file => {
        const valid = file.includes("_");
        const valid2 = file.includes(".log");
        const valid3 = file.includes(".ini");
        if (!valid && !valid2 && !valid3) {
          const nameSplit = file.split(".");
          nameSplit.pop();
          const name = nameSplit.join(".");
          myItems.push(name);
        }
      });
      resolve(myItems);
    });
  });
};

let URL_PRODUCTOS = `https://inventory.zoho.com/api/v1/items?authtoken=9e11de277de1cbb0c55a74daf9474cc5&organization_id=640669816&filter_by=Status.Active&page=${page}&per_page=200`;
const URL_GET_FACTURAS =
  "https://inventory.zoho.com/api/v1/invoices?authtoken=57821900f515778fc22eb5569c6cce4c&organization_id=671555482";
const URL_POST_FACTURAS =
  " https://books.zoho.com/api/v3/invoices?organization_id=671555482&authtoken=f87fc99cf5403c311cc02b3fd1c73ba7";

let bodyFormData = new FormData();

const data = {
  customer_id: 1466041000000078859,
  line_items: [
    {
      item_id: 1466041000000084019
    }
  ]
};

bodyFormData.append("JSONString", JSON.stringify(data));
// console.log(bodyFormData);

const getProductos = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(URL_PRODUCTOS, {
        responseType: "json"
      })
      .then(response => {
        const hasMorePages = response.data.page_context.has_more_page;
        pages.push(response.data.items);
        // console.log(pages[0].items[0].name.toLowerCase());
        resolve(hasMorePages);
      })
      .catch(error => {
        reject(error); //dispatch error
      });
  });
};

// const getFacturas = () => {
//   axios
//     .get(URL_GET_FACTURAS, {
//       responseType: "json"
//     })
//     .then(response => {
//       return console.log(response.data); //LISTA DE FACTURAS
//     })
//     .catch(error => {
//       console.log(error); //dispatch error
//     });
// };

// const createFactura = bodyFormData => {
//   axios({
//     method: "post",
//     url: URL_POST_FACTURAS,
//     data: bodyFormData,
//     headers: bodyFormData.getHeaders()
//   })
//     .then(function(response) {
//       //handle success
//       console.log(response);
//     })
//     .catch(function(response) {
//       //handle error
//       console.log(response);
//     });
// };

// exports.readDirectory = fs.readdir(path, (err, files) => {
//   files.forEach(file => {
//     console.log(file);
//   });
// })

exports.zohoFacturas = getAllPages = async () => {
  const condition = await getProductos();
  if (condition) {
    page++;
    URL_PRODUCTOS = `https://inventory.zoho.com/api/v1/items?authtoken=9e11de277de1cbb0c55a74daf9474cc5&organization_id=640669816&filter_by=Status.Active&page=${page}&per_page=200`;
    getAllPages();
    console.log(page);
  } else {
    const items = await fileCollector();
    for (let i = 0; i < pages.length; i++) {
      const pageBD = pages[i];
      for (let j = 0; j < pageBD.length; j++) {
        const article = pageBD[j];
        if (article.name.includes("Guarnicion")) {
          guarniciones.push(article);
        }
        for (let k = 0; k < items.length; k++) {
          const myItem = items[k];
          const cond1 = article.sku === myItem;
          if (cond1) {
            let receta = {};
            receta.item_id = article.item_id;
            receta.name = article.name;
            receta.description = article.description;
            receta.tax_id = article.tax_id;
            receta.tax_name = article.tax_name;
            receta.tax_percentage = article.tax_percentage;
            receta.sku = article.sku;
            receta.image_name = article.sku + ".jpg";
            receta.cf_familia = article.cf_familia;
            receta.cf_subfamilia = article.cf_subfamilia;
            receta.cf_cant_guarnicion = article.cf_cant_guarnicion;
            receta.precio_receta = article.rate;

            receta.cf_lacteos = [];
            const condLact = article.cf_lacteos !== undefined;
            if (condLact) {
              const cond2 = article.cf_lacteos.length > 0;
              if (cond2) {
                const selector = article.cf_lacteos.split(",");
                for (let i = 0; i < selector.length; i++) {
                  let lact = selector[i].replace(/\s/g, "");
                  receta.cf_lacteos.push(lact.replace(/_/g, " "));
                }
              }
            }
            receta.endulzante = [];
            const condEnd = article.cf_endulzante !== undefined;
            if (condEnd) {
              const cond2 = article.cf_endulzante.length > 0;
              if (cond2) {
                const selector = article.cf_endulzante.split(",");
                for (let i = 0; i < selector.length; i++) {
                  let endul = selector[i].replace(/\s/g, "");
                  receta.endulzante.push(endul.replace(/_/g, " "));
                }
              }
            }
            receta.cf_temperatura = [];
            const condTemp = article.cf_temperatura !== undefined;
            if (condTemp) {
              const cond2 = article.cf_temperatura.length > 0;
              if (cond2) {
                const selector = article.cf_temperatura.split(",");
                for (let i = 0; i < selector.length; i++) {
                  let tempe = selector[i].replace(/\s/g, "");
                  receta.cf_temperatura.push(tempe.replace(/_/g, " "));
                }
              }
            }
            receta.cf_ingredientes = [];
            const condIngre = article.cf_ingredientes !== undefined;
            if (condIngre) {
              const cond2 = article.cf_ingredientes.length > 0;
              if (cond2) {
                const selector = article.cf_ingredientes.split(",");
                for (let i = 0; i < selector.length; i++) {
                  let ingre = selector[i].replace(/\s/g, "");
                  receta.cf_ingredientes.push(ingre.replace(/_/g, " "));
                }
              }
            }
            receta.cf_cocci_n = [];
            const condTerm = article.cf_cocci_n !== undefined;
            if (condTerm) {
              const cond2 = article.cf_cocci_n.length > 0;
              if (cond2) {
                const selector = article.cf_cocci_n.split(",");
                for (let i = 0; i < selector.length; i++) {
                  let term = selector[i].replace(/\s/g, "");
                  receta.cf_cocci_n.push(term.replace(/_/g, " "));
                }
              }
            }
            receta.guarSku = article.cf_guarnicion;
            recetas.push(receta);
            items.splice(k, 1);
            break;
          }
        }
      }
    }
    recetas.forEach(receta => {
      //CONDICIONES DE FILTRO PARA GUARNICIONES
      receta.cf_guarnicion = [];
      if (receta.guarSku !== undefined) {
        if (receta.guarSku.length > 0) {
          guarniciones.forEach(guarnicion => {
            let subGuarni = {};
            subGuarni.name = guarnicion.name.replace(/Guarnicion de /g, "");
            subGuarni.sku = guarnicion.sku;
            receta.cf_guarnicion.push(subGuarni);
          });
        }
      }
      RecetaYacho.addReceta(receta, (err, receta) => {
        if (err) {
          throw err;
        }
      });
    });
  }
};
