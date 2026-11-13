const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const adminRepository = require('../repositories/adminRepository');

async function login(entrada) {
    const email = typeof entrada.email === 'string'
        ? entrada.email.trim().toLowerCase()
        : '';

    const senha = typeof entrada.senha === 'string'
        ? entrada.senha
        : '';

    if (!email || !senha) {
        throw new AppError('E-mail e senha são obrigatórios.', 400);
    }

    const administrador = await adminRepository.buscarPorEmail(email);

    // Não informa se o e-mail existe ou se a senha está incorreta.
    if (!administrador || !administrador.ativo) {
        throw new AppError('E-mail ou senha inválidos.', 401);
    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        administrador.senha_hash
    );

    if (!senhaCorreta) {
        throw new AppError('E-mail ou senha inválidos.', 401);
    }

    if (!process.env.JWT_SECRET) {
        throw new AppError('Chave JWT não configurada no servidor.', 500);
    }

    const token = jwt.sign(
        { id: administrador.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return {
        administrador: {
            id: administrador.id,
            nome: administrador.nome,
            email: administrador.email
        },
        token
    };
}

module.exports = {
    login
};