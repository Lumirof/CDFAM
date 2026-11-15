const { Router } = require('express');
const internshipPageController = require('../controllers/internshipPageController');

const publicas = Router();

publicas.get('/', internshipPageController.buscar);

const admin = Router();

admin.get('/', internshipPageController.buscar);
admin.put('/', internshipPageController.atualizar);

module.exports = { publicas, admin };