const activityInternshipService = require('../services/activityInternshipService');

async function listarPublicos(req, res, next) {
    try {
        const resultado = await activityInternshipService.listarPublicos(req.query.modalidade);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function listarAdmin(req, res, next) {
    try {
        const resultado = await activityInternshipService.listarAdmin(req.query.modalidade);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const resultado = await activityInternshipService.buscarPorId(req.params.id);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarPublicoPorId(req, res, next) {
    try {
        const resultado = await activityInternshipService.buscarPublicoPorId(req.params.id);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const resultado = await activityInternshipService.criar(
            req.body,
            req.user?.id
        );

        res.status(201).json({
            mensagem: 'Atividade de estágio cadastrada com sucesso.',
            atividade: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        const resultado = await activityInternshipService.atualizar(
            req.params.id,
            req.body,
            req.user?.id
        );

        res.status(200).json({
            mensagem: 'Atividade de estágio atualizada com sucesso.',
            atividade: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function desativar(req, res, next) {
    try {
        await activityInternshipService.desativar(req.params.id);

        res.status(200).json({
            mensagem: 'Atividade de estágio desativada com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    buscarPublicoPorId,
    criar,
    atualizar,
    desativar
};