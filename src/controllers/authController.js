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

async function alterarSenha(req, res, next) {
    try {
        await authService.alterarSenha(req.user.id, req.body);

        return res.status(200).json({
            mensagem: 'Senha alterada com sucesso.'
        });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        return res.status(200).json({
            mensagem: 'Logout realizado com sucesso. Remova o token armazenado no cliente.'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    alterarSenha,
    logout
};