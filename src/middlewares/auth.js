const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const AppError = require('../utils/AppError');

async function auth(req, res, next) {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AppError('Token não informado.', 401);
        }

        const token = authorization.split(' ')[1];
        if (!process.env.JWT_SECRET) {
            throw new AppError('Chave JWT não configurada.', 500);
        }

        let dadosToken;
        try {
            dadosToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new AppError('Token inválido ou expirado.', 401);
        }

        const [administradores] = await pool.query(
            `SELECT id, nome, email, ativo
             FROM administrador
             WHERE id = ? AND ativo = TRUE`,
            [dadosToken.id]
        );

        if (administradores.length === 0) {
            throw new AppError('Administrador não encontrado ou inativo.', 401);
        }

        req.user = administradores[0];
        next();

    } catch (err) {
        next(err);
    }
}

module.exports = auth;