const mysql = require('mysql');

const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bd_solicitud'
});

module.exports = pool;
