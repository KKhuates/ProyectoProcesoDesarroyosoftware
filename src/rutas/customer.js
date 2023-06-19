const express = require('express');
const router = express.Router();
const customerController = require('../controladores/customerController');
const { upload } = require('../controladores/customerController');

router.get('/', customerController.mostrarInicio);
router.get('/login', customerController.mostrarFormularioLogin);
router.get('/registros', customerController.registrarUsuario);
router.get('/subir_consultoria', customerController.mostrarFormularioSubirConsultoria);
router.get('/Inicio_admin', customerController.obtenerUsuariosConConsultorias);
router.get('/Inicio_admin', customerController.mostrarInicioAdmin);
router.get('/Inicio_estudiante', customerController.mostrarInicioEstudiante);
router.get('/Inicio_cimite',customerController.mostrarInicioComite);


router.post('/eliminarUsuario/:rut', customerController.eliminarUsuario);
router.post('/login', customerController.iniciarSesion);
router.post('/registros', customerController.registrarUsuario);
router.post('/subir_consultoria', upload.single('file'), customerController.mostrarFormularioSubirConsultoria);

module.exports = router;
