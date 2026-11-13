const { Router } = require('express');
const controller = require('../controllers/noticeController');

const publicas = Router();

publicas.get('/', controller.listarPublicas);
publicas.get('/:slug', controller.buscarPorSlug);

const admin = Router();

admin.get('/', controller.listarAdmin);
admin.get('/:id', controller.buscarPorId);
admin.post('/', controller.criar);
admin.put('/:id', controller.atualizar);
admin.delete('/:id', controller.remover);

module.exports = { publicas, admin };