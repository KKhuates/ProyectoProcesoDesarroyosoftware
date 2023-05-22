const express = require('express');
const router = express.Router();

const customerController= require('../controladores/customerController');

router.get('/', customerController.list);

module.exports= router;
