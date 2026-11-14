const serviceHorarioService = require('../services/serviceHorarioService');

async function listarAdmin(req, res, next) {
    try {
        const horarios = await serviceHorarioService.listarAdmin();
        return res.status(200).json(horarios);
    } catch (erro) {
        next(erro);
    }
}

async function listarPublicos(req, res, next) {
    try {
        const horarios = await serviceHorarioService.listarPublicos();
        return res.status(200).json(horarios);
    } catch (erro) {
        next(erro);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const horario = await serviceHorarioService.buscarPorId(req.params.id);
        return res.status(200).json(horario);
    } catch (erro) {
        next(erro);
    }
}

async function criar(req, res, next) {
    try {
        const id = await serviceHorarioService.criar(req.body);

        return res.status(201).json({
            mensagem: 'Horário cadastrado com sucesso.',
            id
        });
    } catch (erro) {
        next(erro);
    }
}

async function atualizar(req, res, next) {
    try {
        await serviceHorarioService.atualizar(req.params.id, req.body);

        return res.status(200).json({
            mensagem: 'Horário atualizado com sucesso.'
        });
    } catch (erro) {
        next(erro);
    }
}

async function remover(req, res, next) {
    try {
        await serviceHorarioService.remover(req.params.id);

        return res.status(200).json({
            mensagem: 'Horário excluído com sucesso.'
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
    remover
};