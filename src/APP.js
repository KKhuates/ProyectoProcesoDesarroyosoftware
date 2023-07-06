const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const customerController = require('./controlador/customerController');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/Uploads')); // Aquí puedes especificar la ruta donde se almacenarán los archivos subidos.
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

// Función para filtrar por tipo de archivo
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-powerpoint' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    cb(null, true);
  } else {
    cb(new Error('Solo estos tipos de documentos, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX !'), false);
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // limitamos el tamaño del archivo a 10MB
  },
  fileFilter: fileFilter
});

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'pds',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Recuerda configurar esto a true si estás en un entorno de producción con HTTPS habilitado
}));

// Importar rutas
const customerRoutes = require('./rutas/customer'); // Asegúrate de que esta ruta es correcta
app.use('/', customerRoutes);

// Configuración del puerto
app.set('port', process.env.PORT || 3000);
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
app.get('/registrar_admin', customerController.registro_admin_get);
app.post('/registrar_admin', customerController.registro_admin_post);

// Ruta para mostrar la página inicio.ejs
app.get('/', function (req, res) {
  res.render('inicio', { layout: 'layout' });
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Arrancar el servidor y mostrar en qué puerto se está ejecutando
const server = app.listen(app.get('port'), () => {
  console.log(`Server running on port ${server.address().port}`);
});

module.exports = {
  app: app,
  upload: upload
};
