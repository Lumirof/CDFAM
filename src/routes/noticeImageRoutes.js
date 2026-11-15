const { Router } = require('express');
const controller = require('../controllers/noticeImageController');

const publicas = Router();

publicas.get('/', controller.listarPublicas);

const admin = Router();

admin.get('/', controller.listarAdmin);
admin.get('/:id', controller.buscarPorId);
admin.post('/', controller.criar);
admin.put('/:id', controller.atualizar);
admin.delete('/:id', controller.remover);

module.exports = { publicas, admin };