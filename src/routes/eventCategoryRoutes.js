const { Router } = require('express');
const controller = require('../controllers/eventCategoryController');

const publicas = Router();
publicas.get('/', controller.listar);
publicas.get('/:id', controller.buscarPorId);

const admin = Router();

admin.get('/', controller.listar);
admin.get('/:id', controller.buscarPorId);
admin.post('/', controller.criar);
admin.put('/:id', controller.atualizar);
admin.delete('/:id', controller.remover);

module.exports = { publicas, admin };