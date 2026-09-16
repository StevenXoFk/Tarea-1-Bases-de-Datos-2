const { poolPromise } = require("./config/database.js");

poolPromise.then(() => {
    console.log("Conexión exitosa a la base de datos");
    process.exit(0);
})