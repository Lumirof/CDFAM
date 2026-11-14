const { Router } = require('express');
const serviceHorarioController = require('../controllers/serviceHorarioController');

const publicas = Router();

publicas.get('/', serviceHorarioController.listarPublicos);
publicas.get('/:id', serviceHorarioController.buscarPorId);

const admin = Router();

admin.get('/', serviceHorarioController.listarAdmin);
admin.get('/:id', serviceHorarioController.buscarPorId);
admin.post('/', serviceHorarioController.criar);
admin.put('/:id', serviceHorarioController.atualizar);
admin.delete('/:id', serviceHorarioController.remover);

module.exports = {
    publicas,
    admin
};