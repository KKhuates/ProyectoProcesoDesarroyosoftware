const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const app = express();
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.use(expressLayouts);

// Importar rutas
const customerRoutes = require('./rutas/customer'); // Asegúrate de que esta ruta es correcta

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Recuerda configurar esto a true si estás en un entorno de producción con HTTPS habilitado
}));
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

// Ruta para mostrar la página inicio.ejs
app.get('/', function(req, res) {
    res.render('inicio');
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Arrancar el servidor y mostrar en qué puerto se está ejecutando
const server = app.listen(app.get('port'), () => {
  console.log(`Server running on port ${server.address().port}`);
});
