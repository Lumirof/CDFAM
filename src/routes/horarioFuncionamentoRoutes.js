const express = require('express');
const router = express.Router();

const horarioFuncionamentoController = require('../controllers/horarioFuncionamentoController');

const publicas = express.Router();

publicas.get('/', horarioFuncionamentoController.listarPublicos);

const admin = express.Router();

admin.get('/', horarioFuncionamentoController.listarAdmin);
admin.get('/:id', horarioFuncionamentoController.buscarPorId);
admin.post('/', horarioFuncionamentoController.criar);
admin.put('/:id', horarioFuncionamentoController.atualizar);
admin.patch('/:id/desativar', horarioFuncionamentoController.desativar);

module.exports = { publicas, admin };