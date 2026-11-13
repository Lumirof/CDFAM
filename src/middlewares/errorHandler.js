 // 404 para rotas que não existem
function naoEncontrado(req, res, next) {
    res.status(404).json({
        erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`
    });
}

// Tratador central de erros
function errorHandler(err, req, res, next) {

    // JSON malformado no corpo da requisição
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            erro: 'JSON inválido no corpo da requisição.'
        });
    }

    // Código HTTP do erro
    const status = err.statusCode || err.status || 500;

    // Exibe erros internos no terminal
    if (status === 500) {
        console.error(err);
    }

    // Resposta padronizada
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
