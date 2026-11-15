const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/AppError');
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


async function alterarSenha(idAdministrador, dados) {
    const senhaAtual = typeof dados.senhaAtual === 'string'
        ? dados.senhaAtual
        : '';

    const novaSenha = typeof dados.novaSenha === 'string'
        ? dados.novaSenha
        : '';

    const confirmarSenha = typeof dados.confirmarSenha === 'string'
        ? dados.confirmarSenha
        : '';

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        throw new AppError('Todos os campos de senha são obrigatórios.', 400);
    }

    if (novaSenha.length < 8) {
        throw new AppError('A nova senha deve ter pelo menos 8 caracteres.', 400);
    }

    if (novaSenha !== confirmarSenha) {
        throw new AppError('A confirmação da nova senha não corresponde.', 400);
    }

    if (senhaAtual === novaSenha) {
        throw new AppError('A nova senha deve ser diferente da senha atual.', 400);
    }

    const administrador = await adminRepository.buscarSenhaPorId(idAdministrador);

    if (!administrador || !administrador.ativo) {
        throw new AppError('Administrador não encontrado ou inativo.', 404);
    }

    const senhaCorreta = await bcrypt.compare(
        senhaAtual,
        administrador.senha_hash
    );

    if (!senhaCorreta) {
        throw new AppError('A senha atual está incorreta.', 401);
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await adminRepository.atualizarSenha(
        idAdministrador,
        senhaHash
    );
}


module.exports = {
    login,
    alterarSenha
};