const { Router } = require('express');
const controller = require('../controllers/eventController');

const publicas = Router();
publicas.get('/categorias', controller.listarCategorias);
publicas.get('/', controller.listarPublicos);
publicas.get('/:id', controller.buscarPublicoPorId);

const admin = Router();

admin.get('/', controller.listarAdmin);
admin.get('/:id', controller.buscarPorId);
admin.post('/', controller.criar);
admin.put('/:id', controller.atualizar);
admin.delete('/:id', controller.remover);

module.exports = { publicas, admin };