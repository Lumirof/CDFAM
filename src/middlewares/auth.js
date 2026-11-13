const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const AppError = require('../utils/appError');

async function auth(req, res, next) {
    try {
        // Verifica se o token foi enviado
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AppError('Token não informado.', 401);
        }

        // Separa o token da palavra Bearer
        const token = authorization.split(' ')[1];

        // Verifica se existe uma chave secreta configurada
        if (!process.env.JWT_SECRET) {
            throw new AppError('Chave JWT não configurada.', 500);
        }

        // Valida o token
        let dadosToken;

        try {
            dadosToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new AppError('Token inválido ou expirado.', 401);
        }

        // Busca o administrador no banco
        const [administradores] = await pool.query(
            `SELECT id, nome, email, ativo
             FROM administrador
             WHERE id = ? AND ativo = TRUE`,
            [dadosToken.id]
        );

        if (administradores.length === 0) {
            throw new AppError('Administrador não encontrado ou inativo.', 401);
        }

        // Disponibiliza os dados do administrador para outras camadas
        req.user = administradores[0];

        next();

    } catch (err) {
        next(err);
    }
}

module.exports = auth;