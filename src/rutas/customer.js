const express = require('express');
const router = express.Router();
const customerController = require('../controlador/customerController');
const multer = require('multer');
const path = require('path');
  

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../Uploads')); // Asegúrate de proporcionar la ruta correcta para almacenar los archivos subidos
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten los siguientes tipos de archivos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX'), false);
  }
};

const uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100 // Limita el tamaño del archivo a 100MB
  },
  fileFilter: fileFilter
});



//POSTS


router.post('/actualizar_consultoria/:id', uploads.single('archivo'), customerController.actualizar_consultoria_post);
router.post('/evaluar_consultoria', customerController.evaluar_consultoria_post); //si
router.post('/registrar_admin',customerController.registro_admin_post);//si 
router.post('/cargar_consultoria', uploads.single('archivo'), customerController.cargar_consultoria_post ); //si
router.post('/editar_usuario/:id', customerController.editar_usuario_post); //si 
router.post('/login', customerController.login_post); //si


//GET    
router.get('/descargar/:id', customerController.descargar_archivo);
router.get('/inicio_admin', customerController.inicio_admin_get); //si
router.get('/login', customerController.login_get); //si
router.get('/borrar_usuario/:id', customerController.borrar_usuario); //si
router.get('/editar_usuario/:id', customerController.editar_usuario_get); //si
router.get('/inicio_estudiante', customerController.inicio_estudiante_get); //si
router.get('/cargar_consultoria', customerController.cargar_consultoria_get);//SI
router.get('/registrar_admin',customerController.registro_admin_get); //si 
router.get('/consultorias', customerController.ver_consultorias_get); //Si
router.get('/logout', customerController.logout);
router.get('/inicio_comite', customerController.inicio_comite_get);
router.get('/actualizar_consultoria/:id', customerController.actualizar_consultoria_get);

module.exports = router;
