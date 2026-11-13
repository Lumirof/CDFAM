const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const adminRepository = require('../repositories/adminRepository');

function paraId(valor) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('ID de administrador inválido.', 400);
    }

    return id;
}

function validarDados(dados, atualizacao = false) {
    const erros = [];

    if (!dados.nome || typeof dados.nome !== 'string' || !dados.nome.trim()) {
        erros.push('Nome é obrigatório.');
    } else if (dados.nome.trim().length > 150) {
        erros.push('Nome deve ter no máximo 150 caracteres.');
    }

    if (!dados.email || typeof dados.email !== 'string') {
        erros.push('E-mail é obrigatório.');
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())
    ) {
        erros.push('E-mail inválido.');
    } else if (dados.email.trim().length > 150) {
        erros.push('E-mail deve ter no máximo 150 caracteres.');
    }

    if (!atualizacao && (!dados.senha || typeof dados.senha !== 'string')) {
        erros.push('Senha é obrigatória.');
    }

    if (dados.senha !== undefined && dados.senha !== '') {
        if (typeof dados.senha !== 'string' || dados.senha.length < 8) {
            erros.push('A senha deve ter pelo menos 8 caracteres.');
        }
    }

    if (erros.length) {
        throw new AppError('Dados inválidos.', 400, erros);
    }
}

async function listar() {
    return adminRepository.listar();
}

async function buscarPorId(valor) {
    const id = paraId(valor);

    const administrador = await adminRepository.buscarPorId(id);

    if (!administrador) {
        throw new AppError('Administrador não encontrado.', 404);
    }

    return administrador;
}

async function criar(entrada) {
    validarDados(entrada);

    const email = entrada.email.trim().toLowerCase();

    const existente = await adminRepository.buscarPorEmail(email);

    if (existente) {
        throw new AppError('Já existe um administrador com esse e-mail.', 409);
    }

    const senhaHash = await bcrypt.hash(entrada.senha, 12);

    try {
        const id = await adminRepository.criar({
            nome: entrada.nome.trim(),
            email,
            senha_hash: senhaHash
        });

        return await buscarPorId(id);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new AppError('Já existe um administrador com esse e-mail.', 409);
        }

        throw err;
    }
}

async function atualizar(valor, entrada) {
    const id = paraId(valor);

    await buscarPorId(id);

    validarDados(entrada, true);

    const email = entrada.email.trim().toLowerCase();

    const outroAdministrador = await adminRepository.buscarPorEmail(email);

    if (outroAdministrador && outroAdministrador.id !== id) {
        throw new AppError('Esse e-mail já está sendo utilizado.', 409);
    }

    let senhaHash = null;

    if (entrada.senha) {
        senhaHash = await bcrypt.hash(entrada.senha, 12);
    }

    try {
        await adminRepository.atualizar(id, {
            nome: entrada.nome.trim(),
            email,
            senha_hash: senhaHash
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new AppError('Esse e-mail já está sendo utilizado.', 409);
        }

        throw err;
    }

    return buscarPorId(id);
}

async function desativar(id, administradorLogadoId) {
    const administradorId = paraId(id);

    if (Number(administradorId) === Number(administradorLogadoId)) {
        throw new AppError(
            'Você não pode desativar sua própria conta.',
            400
        );
    }

    const administrador = await adminRepository.buscarPorId(administradorId);

    if (!administrador) {
        throw new AppError('Administrador não encontrado.', 404);
    }

    if (!administrador.ativo) {
        throw new AppError('Este administrador já está desativado.', 400);
    }

    const desativado = await adminRepository.desativarSeNaoForUltimo(
        administradorId
    );

    if (!desativado) {
        throw new AppError(
            'Não é possível desativar o último administrador ativo.',
            400
        );
    }
}

async function reativar(id) {
    const administradorId = paraId(id);

    const administrador = await adminRepository.buscarPorId(administradorId);

    if (!administrador) {
        throw new AppError('Administrador não encontrado.', 404);
    }

    if (administrador.ativo) {
        throw new AppError('Este administrador já está ativo.', 400);
    }

    await adminRepository.reativar(administradorId);

    return {
        mensagem: 'Administrador reativado com sucesso.'
    };
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    desativar,
    reativar
};