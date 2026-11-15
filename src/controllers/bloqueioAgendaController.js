const bloqueioAgendaService = require('../services/bloqueioAgendaService');

async function listarPublicos(req, res, next) {
    try {
        const resultado = await bloqueioAgendaService.listarPublicos();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function listarAdmin(req, res, next) {
    try {
        const resultado = await bloqueioAgendaService.listarAdmin();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const resultado = await bloqueioAgendaService.buscarPorId(req.params.id);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const resultado = await bloqueioAgendaService.criar({
            ...req.body,
            atualizado_por: req.user?.id
        });

        res.status(201).json({
            mensagem: 'Bloqueio de agenda cadastrado com sucesso.',
            id: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        await bloqueioAgendaService.atualizar(req.params.id, {
            ...req.body,
            atualizado_por: req.user?.id
        });

        res.status(200).json({
            mensagem: 'Bloqueio de agenda atualizado com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

async function excluir(req, res, next) {
    try {
        await bloqueioAgendaService.excluir(req.params.id);

        res.status(200).json({
            mensagem: 'Bloqueio de agenda excluído com sucesso.'
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
    excluir
};