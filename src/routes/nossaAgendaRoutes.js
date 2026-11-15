const { Router } = require('express');
const nossaAgendaController = require('../controllers/nossaAgendaController');

const publicas = Router();

publicas.get('/vigente', nossaAgendaController.buscarVigente);

const admin = Router();

admin.get('/', nossaAgendaController.listarAdmin);
admin.get('/:id', nossaAgendaController.buscarPorId);
admin.post('/', nossaAgendaController.criar);
admin.put('/:id', nossaAgendaController.atualizar);
admin.delete('/:id', nossaAgendaController.excluir);

module.exports = { publicas, admin };