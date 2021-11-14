// const request = require("request");

// const configs = require("../src/configs/configs");
// const URL_DAEMON = configs.urlDaemon;

// const awakeDaemon = () => {
//   console.log(URL_DAEMON);
//   return new Promise((resolve, reject) => {
//     request.post(URL_DAEMON, (err, response, body) => {
//       resolve("done");
//     });
//   });
// };

// awakeDaemon();

//resp "ABAD"
// let s1 = "ABAZDC";
// let s2 = "BACBAD";
// let result = "";
// let index = {};
// const longSeq = (s1, s2) => {
//   for (let i = 0; i < s1.length; i++) {
//     const char = s1[i];
    
//     if (index.hasOwnProperty(char)) {
//       index[char] += 1;
//     } else {
//       index[char] = 0;
//     }
//   }
//   for (let i = 0; i < s2.length; i++) {
//     const char = s2[i];
//     if (index.hasOwnProperty(char)) {
//       index[char] += 1;
//     } else {
//       index[char] = 0;
//     }
//   }
// };

// longSeq(s1, s2);
// console.log(index);

let arr = ["test","test2"]

if(arr === "No"){
  console.log("kkk")
} else {
  console.log("is array")
}

