const { Router } = require('express');
const serviceController = require('../controllers/serviceController');

const publicas = Router();

publicas.get('/', serviceController.listarPublicos);
publicas.get('/:id', serviceController.buscarPorId);

const admin = Router();

admin.get('/', serviceController.listarAdmin);
admin.get('/:id', serviceController.buscarPorId);
admin.post('/', serviceController.criar);
admin.put('/:id', serviceController.atualizar);
admin.delete('/:id', serviceController.desativar);

module.exports = { publicas, admin };