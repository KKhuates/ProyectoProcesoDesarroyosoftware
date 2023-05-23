const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const app = express();

// Importar rutas
const customerRoutes = require('./rutas/customer');

// Configuración del puerto
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(morgan('dev'));

const dbOptions = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'bd_solicitud'
};

app.use(myConnection(mysql, dbOptions, 'single'));
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/', customerRoutes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
  console.log('Server on port 3000');
});
