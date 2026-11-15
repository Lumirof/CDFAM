const express = require('express');

const bloqueioAgendaController = require('../controllers/bloqueioAgendaController');

const publicas = express.Router();

publicas.get('/', bloqueioAgendaController.listarPublicos);

const admin = express.Router();

admin.get('/', bloqueioAgendaController.listarAdmin);
admin.get('/:id', bloqueioAgendaController.buscarPorId);
admin.post('/', bloqueioAgendaController.criar);
admin.put('/:id', bloqueioAgendaController.atualizar);
admin.delete('/:id', bloqueioAgendaController.excluir);

module.exports = { publicas, admin };