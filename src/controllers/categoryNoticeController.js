const categoryService = require('../services/categoryNoticeService');

async function listar(req, res, next) {
    try {
        const categorias = await categoryService.listar();

        res.status(200).json(categorias);
    } catch (err) {
        next(err);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const categoria = await categoryService.buscarPorId(req.params.id);

        res.status(200).json(categoria);
    } catch (err) {
        next(err);
    }
}

async function criar(req, res, next) {
    try {
        const categoria = await categoryService.criar(req.body);

        res.status(201).json({
            mensagem: 'Categoria cadastrada com sucesso.',
            categoria
        });
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        const categoria = await categoryService.atualizar(
            req.params.id,
            req.body
        );

        res.status(200).json({
            mensagem: 'Categoria atualizada com sucesso.',
            categoria
        });
    } catch (err) {
        next(err);
    }
}

async function remover(req, res, next) {
    try {
        await categoryService.remover(req.params.id);

        res.status(200).json({
            mensagem: 'Categoria excluída com sucesso.'
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
    remover
};