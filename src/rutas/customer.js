const express = require('express');
const router = express.Router();

const customerController = require('../controladores/customerController');

router.get('/', customerController.mostrarInicio);
router.get('/menuprincipal', customerController.mostrarMenuPrincipal);
router.get('/paginaerror', customerController.paginaError);
router.get('/login', customerController.mostrarFormularioLogin);
router.get('/registros', customerController.mostrarFormularioRegistro);
router.post('/login', customerController.iniciarSesion);
router.post('/registros', customerController.registrarUsuario);

module.exports = router;
