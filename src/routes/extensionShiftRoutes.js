const { Router } = require('express');
const controller = require('../controllers/extensionShiftController');

const porAcao = Router();
porAcao.get('/:id/turnos', controller.listarPorAcao);
porAcao.post('/:id/turnos', controller.criar);

const admin = Router();
admin.get('/extensao/:id/turnos', controller.listarPorAcao);   
admin.post('/extensao/:id/turnos', controller.criar);          
admin.put('/extensao-turnos/:id', controller.atualizar);       
admin.delete('/extensao-turnos/:id', controller.remover);   

module.exports = { porAcao, admin };
