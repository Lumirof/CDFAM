const { Router } = require('express');
const categoryController = require('../controllers/categoryNoticeController');

const publicas = Router();

publicas.get('/', categoryController.listar);
publicas.get('/:id', categoryController.buscarPorId);

const admin = Router();

admin.get('/', categoryController.listar);
admin.get('/:id', categoryController.buscarPorId);
admin.post('/', categoryController.criar);
admin.put('/:id', categoryController.atualizar);
admin.delete('/:id', categoryController.remover);

module.exports = { publicas, admin };