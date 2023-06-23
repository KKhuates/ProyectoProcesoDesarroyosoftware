// customer.js

const express = require('express');
const router = express.Router();

const customerController = require('mysql/CRUD-ND-MYSQL/src/controlador/customerController');
router.get('/inicio_admin', customerController.inicio_admin_get);
router.get('/login', customerController.login_get);
router.get('/registros',customerController.registro_get);

router.post('/registro', customerController.registro_post);
router.post('/login', customerController.login_post);

module.exports = router;
