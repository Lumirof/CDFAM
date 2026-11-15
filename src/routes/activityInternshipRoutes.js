const { Router } = require('express');
const activityInternshipController = require('../controllers/activityInternshipController');

const publicas = Router();

publicas.get('/', activityInternshipController.listarPublicos);
publicas.get('/:id', activityInternshipController.buscarPublicoPorId);

const admin = Router();

admin.get('/', activityInternshipController.listarAdmin);
admin.get('/:id', activityInternshipController.buscarPorId);
admin.post('/', activityInternshipController.criar);
admin.put('/:id', activityInternshipController.atualizar);
admin.delete('/:id', activityInternshipController.desativar);

module.exports = { publicas, admin };