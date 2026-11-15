const internshipPageService = require('../services/internshipPageService');

async function buscar(req, res, next) {
    try {
        const resultado = await internshipPageService.buscar();

        res.status(200).json(resultado);
    } catch (err) {
        next(err);
    }
}

async function atualizar(req, res, next) {
    try {
        const resultado = await internshipPageService.atualizar(
            req.body,
            req.user?.id
        );

        res.status(200).json({
            mensagem: 'Texto de apresentação atualizado com sucesso.',
            pagina: resultado
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { buscar, atualizar };