const authService = require('../services/authService');

async function login(req, res, next) {
    try {
        const resultado = await authService.login(req.body);

        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            ...resultado
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login
};