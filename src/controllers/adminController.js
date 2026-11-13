const adminService = require('../services/adminService');

async function listar(req, res, next) {
    try {
        const administradores = await adminService.listar();
        res.status(200).json(administradores);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const administrador = await adminService.buscarPorId(req.params.id);
        res.status(200).json(administrador);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const administrador = await adminService.criar(req.body);
        res.status(201).json({
            mensagem: 'Administrador cadastrado com sucesso.',
            administrador
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        const administrador = await adminService.atualizar(
            req.params.id,
            req.body
        );

        res.status(200).json({
            mensagem: 'Administrador atualizado com sucesso.',
            administrador
        });
    } catch (err) {
        next(err);
    }
}

async function desativar(req, res, next) {
    try {
        await adminService.desativar(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            mensagem: 'Administrador desativado com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    desativar
};