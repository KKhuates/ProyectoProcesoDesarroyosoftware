// customer.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const customerController = require('../controlador/customerController');

router.get('/inicio_admin', customerController.inicio_admin_get);
router.get('/login', customerController.login_get);
router.get('/registros',customerController.registro_get);
router.get('/borrar_usuario/:id', customerController.borrar_usuario);
router.get('/editar_usuario/:id', customerController.editar_usuario_get);
router.get('/inicio_estudiante', customerController.inicio_estudiante_get);
router.get('/cargar_consultoria', customerController.cargar_consultoria_get);
router.get('/actualizar_consultoria/:id', customerController.actualizar_consultoria_get);

router.post('/cargar_consultoria', upload.single('documento_archivo'), customerController.cargar_consultoria_post);
router.post('/cargar_consultoria', customerController.cargar_consultoria_post);
router.post('/actualizar_consultoria/:id', customerController.actualizar_consultoria_post);
router.post('/editar_usuario/:id', customerController.editar_usuario_post);
router.post('/registro', customerController.registro_post);
router.post('/login', customerController.login_post);

module.exports = router;
