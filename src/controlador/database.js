const mysql = require('mysql');

const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bd_solicitud'
});

pool.getConnection((err, connection) => {
  if(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('La conexión de la base de datos fue cerrada.');
    }
    if(err.code === 'ER_CON_COUNT_ERROR') {
      console.error('La base de datos tiene demasiadas conexiones.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('La conexión de la base de datos fue rechazada.');
    }
  }

  if (connection) connection.release();

  return;
});

module.exports = pool;
