const serviceService = require('../services/serviceService');

async function listarPublicos(req, res, next) {
    try {
        const resultado = await serviceService.listarPublicos();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function listarAdmin(req, res, next) {
    try {
        const resultado = await serviceService.listarAdmin();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const resultado = await serviceService.buscarPorId(req.params.id);

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const resultado = await serviceService.criar(
            req.body,
            req.user?.id
        );

        res.status(201).json({
            mensagem: 'Serviço cadastrado com sucesso.',
            servico: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        const resultado = await serviceService.atualizar(
            req.params.id,
            req.body,
            req.user?.id
        );

        res.status(200).json({
            mensagem: 'Serviço atualizado com sucesso.',
            servico: resultado
        });
    } catch (err) {
        next(err);
    }
}

async function desativar(req, res, next) {
    try {
        await serviceService.desativar(req.params.id);

        res.status(200).json({
            mensagem: 'Serviço desativado com sucesso.'
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