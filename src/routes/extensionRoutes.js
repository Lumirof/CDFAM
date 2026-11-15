const { Router } = require('express');
const controller = require('../controllers/extensionController');

const publicas = Router();
publicas.get('/', controller.listarPublicas);

const admin = Router();
admin.get('/', controller.listarAdmin);
admin.post('/', controller.criar);
admin.get('/:id', controller.buscarPorId);
admin.put('/:id', controller.atualizar);
admin.patch('/:id/ativa', controller.definirAtiva);
admin.delete('/:id', controller.remover);
admin.get('/:id/turnos', controller.listarTurnos);
admin.post('/:id/turnos', controller.criarTurno);

const adminTurnos = Router();
adminTurnos.put('/:id', controller.atualizarTurno);
adminTurnos.delete('/:id', controller.removerTurno);

module.exports = { publicas, admin, adminTurnos };
