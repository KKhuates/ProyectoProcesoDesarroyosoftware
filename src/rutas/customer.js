const express = require('express');
const router = express.Router();
const customerController = require('../controladores/customerController');
const { upload } = require('../controladores/customerController');

router.get('/', customerController.mostrarInicio);
router.get('/menuprincipal', customerController.mostrarMenuPrincipal);
router.get('/paginaerror', customerController.paginaError);
router.get('/login', customerController.mostrarFormularioLogin);
router.get('/registros', customerController.mostrarFormularioRegistro);
router.get('/subir_consultoria', customerController.mostrarFormularioSubirConsultoria);

router.post('/login', customerController.iniciarSesion);
router.post('/registros', customerController.registrarUsuario);
router.post('/subir_consultoria', upload.single('file'), customerController.mostrarFormularioSubirConsultoria);

module.exports = router;
