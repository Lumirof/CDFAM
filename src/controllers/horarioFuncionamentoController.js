
const horarioFuncionamentoService = require('../services/horarioFuncionamentoService');

async function listarPublicos(req, res, next) {
    try {
        const resultado = await horarioFuncionamentoService.listarPublicos();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function listarAdmin(req, res, next) {
    try {
        const resultado = await horarioFuncionamentoService.listarAdmin();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const resultado = await horarioFuncionamentoService.buscarPorId(req.params.id);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const resultado = await horarioFuncionamentoService.criar({
            ...req.body,
            atualizado_por: req.user?.id
        });

        res.status(201).json({
            mensagem: 'Horário de funcionamento cadastrado com sucesso.',
            id: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        await horarioFuncionamentoService.atualizar(req.params.id, {
            ...req.body,
            atualizado_por: req.user?.id
        });

        res.status(200).json({
            mensagem: 'Horário de funcionamento atualizado com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

async function desativar(req, res, next) {
    try {
        await horarioFuncionamentoService.desativar(req.params.id);

        res.status(200).json({
            mensagem: 'Horário de funcionamento desativado com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    criar,
    atualizar,
    desativar
};
