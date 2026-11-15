const nossaAgendaService = require('../services/nossaAgendaService');

async function listarAdmin(req, res, next) {
    try {
        const resultado = await nossaAgendaService.listarAdmin();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const resultado = await nossaAgendaService.buscarPorId(req.params.id);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarVigente(req, res, next) {
    try {
        const resultado = await nossaAgendaService.buscarVigente();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const resultado = await nossaAgendaService.criar(
            req.body,
            req.user?.id
        );

        res.status(201).json({
            mensagem: 'Mapa de agendamento cadastrado com sucesso.',
            mapa: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        const resultado = await nossaAgendaService.atualizar(
            req.params.id,
            req.body,
            req.user?.id
        );

        res.status(200).json({
            mensagem: 'Mapa de agendamento atualizado com sucesso.',
            mapa: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function excluir(req, res, next) {
    try {
        await nossaAgendaService.excluir(
            req.params.id,
            req.query.confirmar === 'true'
        );

        res.status(200).json({
            mensagem: 'Mapa de agendamento excluído com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listarAdmin,
    buscarPorId,
    buscarVigente,
    criar,
    atualizar,
    excluir
};