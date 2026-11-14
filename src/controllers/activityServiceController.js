const activityServiceService = require('../services/activityServiceService');

async function listarAdmin(req, res, next) {
    try {
        const atividades = await activityServiceService.listarAdmin();
        return res.status(200).json(atividades);
    } catch (erro) {
        next(erro);
    }
}

async function listarPublicos(req, res, next) {
    try {
        const atividades = await activityServiceService.listarPublicos();
        return res.status(200).json(atividades);
    } catch (erro) {
        next(erro);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const atividade = await activityServiceService.buscarPorId(req.params.id);
        return res.status(200).json(atividade);
    } catch (erro) {
        next(erro);
    }
}

async function criar(req, res, next) {
    try {
        const id = await activityServiceService.criar(req.body);

        return res.status(201).json({
            mensagem: 'Atividade cadastrada com sucesso.',
            id
        });
    } catch (erro) {
        next(erro);
    }
}

async function atualizar(req, res, next) {
    try {
        await activityServiceService.atualizar(req.params.id, req.body);

        return res.status(200).json({
            mensagem: 'Atividade atualizada com sucesso.'
        });
    } catch (erro) {
        next(erro);
    }
}

async function desativar(req, res, next) {
    try {
        await activityServiceService.desativar(req.params.id);

        return res.status(200).json({
            mensagem: 'Atividade desativada com sucesso.'
        });
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    listarAdmin,
    listarPublicos,
    buscarPorId,
    criar,
    atualizar,
    desativar
};