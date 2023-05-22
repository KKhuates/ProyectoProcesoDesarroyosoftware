const mysql = require("mysql");
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'bd_solicitud'
});

conn.connect(function (err){
    if(err){
        console.log(err);
        return;
    }
    else{
        console.log("La base de datos se ha conectado exitosamente");
        
    }
});

module.exports = conn;