const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const myConnection = require('express-myconnection');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const customerController = require('./controlador/customerController');
var passport = require('passport');


// Configuración de la sesión
app.use(session({
  secret: 'pds',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Recuerda configurar esto a true si estás en un entorno de producción con HTTPS habilitado
}));

// Importar rutas
const customerRoutes = require('./rutas/customer'); // Asegúrate de que esta ruta es correcta

// Configuración del puerto y vistas
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de Express Layouts
app.set('layout', 'layout'); // Establece 'layout.ejs' como el layout predeterminado
app.use(expressLayouts);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

// Configuración de Flash y Middlewares
app.use(flash());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  next();
});

// Configuración de la conexión a la base de datos
const dbOptions = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'bd_solicitud'
};
app.use(myConnection(mysql, dbOptions, 'single'));

// Rutas
app.use('/', customerRoutes);
app.get('/registrar_admin', customerController.registro_admin_get);
app.post('/registrar_admin', customerController.registro_admin_post);

app.get('/', function (req, res) {
  res.render('inicio', { layout: 'layout' });
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Arrancar el servidor y mostrar en qué puerto se está ejecutando
const server = app.listen(app.get('port'), () => {
  console.log(`Server running on port ${server.address().port}`);
});

module.exports.app = app;
