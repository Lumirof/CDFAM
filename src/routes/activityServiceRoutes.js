const express = require('express');
const router = express.Router();

const activityServiceController = require('../controllers/activityServiceController');

const publicas = express.Router();

publicas.get('/', activityServiceController.listarPublicos);

const admin = express.Router();

admin.get('/', activityServiceController.listarAdmin);
admin.get('/:id', activityServiceController.buscarPorId);
admin.post('/', activityServiceController.criar);
admin.put('/:id', activityServiceController.atualizar);
admin.patch('/:id/desativar', activityServiceController.desativar);

module.exports = { publicas, admin };