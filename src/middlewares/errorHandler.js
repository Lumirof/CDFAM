function naoEncontrado(req, res, next) {
    res.status(404).json({
        erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`
    });
}

function errorHandler(err, req, res, next) {

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            erro: 'JSON inválido no corpo da requisição.'
        });
    }

    const status = err.statusCode || err.status || 500;

    if (status === 500) {
        console.error(err);
    }

    res.status(status).json({
        erro: status === 500
            ? 'Erro interno do servidor.'
            : err.message,
        detalhes: err.detalhes || undefined
    });
}

module.exports = {
    errorHandler,
    naoEncontrado
};