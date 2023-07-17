const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const myConnection = require('express-myconnection');
const bcrypt = require('bcrypt');  // Asegúrate de tener esto instalado
const app = express();
const expressLayouts = require('express-ejs-layouts');
const customerController = require('./controlador/customerController');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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


// Configuración de la estrategia de autenticación local
passport.use(new LocalStrategy(
  function(username, password, done) {
    const db = require('./db');  // Asegúrate de que esta ruta es correcta
    db.query('SELECT * FROM usuario WHERE correo_electronico = ?', [username], function(err, results, fields) {
      if (err) { done(err) }

      if (results.length === 0) {
        done(null, false, { message: 'Usuario no encontrado' });
      } else {
        const hash = results[0].password.toString();

        bcrypt.compare(password, hash, function(err, response) {
          if (response === true) {
            return done(null, { user_id: results[0].id_usuario });
          } else {
            return done(null, false, { message: 'Contraseña incorrecta' });
          }
        });
      }
    });
  }
));

// Función para serializar usuarios
passport.serializeUser(function(user, done) {
  done(null, user.user_id);
});

// Función para deserializar usuarios
passport.deserializeUser(function(id, done) {
  const db = require('./db');  // Asegúrate de que esta ruta es correcta
  db.query('SELECT id_usuario, id_tipo_usuario FROM usuario WHERE id_usuario = ?', [id], function(err, results, fields) {
    if (results.length === 0) {
      done(new Error('Usuario no encontrado'));
    } else {
      done(err, { user_id: results[0].id_usuario, role: results[0].id_tipo_usuario });
    }
  });
});

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
