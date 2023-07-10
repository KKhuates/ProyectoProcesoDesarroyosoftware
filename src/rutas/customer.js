// customer.js
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
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-powerpoint' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    cb(null, true);
  } else {
    cb(new Error('Solo estos tipos de documentos, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX !'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // Limita el tamaño del archivo a 10MB
  },
  fileFilter: fileFilter
});

router.get('/inicio_admin', customerController.inicio_admin_get); //si
router.get('/login', customerController.login_get); //si
router.get('/borrar_usuario/:id', customerController.borrar_usuario); //si
router.get('/editar_usuario/:id', customerController.editar_usuario_get); //si
router.get('/inicio_estudiante', customerController.inicio_estudiante_get); //si
router.get('/cargar_consultoria', customerController.cargar_consultoria_get);//SI
router.get('/actualizar_consultoria/:id', customerController.actualizar_consultoria_get); //si
router.get('/registrar_admin',customerController.registro_admin_get); //si 
router.get('/consultorias', customerController.ver_consultorias_get); //Si
router.get('/logout', customerController.logout);

router.post('/evaluar_consultoria', customerController.evaluar_consultoria_post); //si
router.post('/registrar_admin',customerController.registro_admin_post);//si 
router.post('/cargar_consultoria', upload.single('archivo'), customerController.cargar_consultoria_post); //si
router.post('/actualizar_consultoria/:id', customerController.actualizar_consultoria_post); //si
router.post('/editar_usuario/:id', customerController.editar_usuario_post); //si 
router.post('/login', customerController.login_post); //si

module.exports = router;
