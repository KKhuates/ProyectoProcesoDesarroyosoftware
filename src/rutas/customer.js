const express = require('express');
const router = express.Router();
const customerController = require('../controladores/customerController');
const { upload } = require('../controladores/customerController');

router.get('/', customerController.mostrarInicio);
router.get('/login', customerController.mostrarFormularioLogin);
        
router.get('/Inicio_admin', customerController.obtenerUsuariosConConsultorias);
router.get('/Inicio_admin', customerController.mostrarInicioAdmin);
router.get('/Inicio_Estudiante', customerController.mostrarInicioEstudiante);
router.get('/Inicio_cimite',customerController.mostrarInicioComite);
router.get('/registros_admin',customerController.registros_admin);

router.post('/login',customerController.iniciarSesion)
router.post('/eliminarUsuario/:rut', customerController.eliminarUsuario);
router.post('/registros', customerController.registrarUsuario);
router.post('/Inicio_Estudiante', upload.single('file'), customerController.subirConsultoria);
router.post('/registrar_consultoria',customerController.subirConsultoria);
router.post('/subir_consultoria', customerController.subirConsultoria);
router.get('/Inicio_admin', customerController.mostrarInicioAdmin);
router.get('/Inicio_Estudiante', customerController.mostrarInicioEstudiante);
router.get('/Inicio_Comite', customerController.mostrarInicioComite);
router.get('/registros_admin', customerController.registros_admin);

router.post('/login', customerController.iniciarSesion);
router.post('/eliminarUsuario/:rut', customerController.eliminarUsuario);
router.post('/registros', customerController.registrarUsuario);
router.post('/subir_consultoria', customerController.subirConsultoria);
app.post('/subir_consultoria', upload.single('file'), subirConsultoria);
module.exports = router;
