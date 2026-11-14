const activityServiceRepository = require('../repositories/activityServiceRepository');
const AppError = require('../utils/AppError');

function validar(dados) {
    const erros = [];

    const servicoId = Number(dados.servico_id);

    if (!Number.isInteger(servicoId) || servicoId <= 0) {
        erros.push('Selecione um serviço válido.');
    }

    if (
        !dados.nome ||
        typeof dados.nome !== 'string' ||
        !dados.nome.trim()
    ) {
        erros.push('O nome da atividade é obrigatório.');
    } else if (dados.nome.trim().length > 150) {
        erros.push('O nome deve ter no máximo 150 caracteres.');
    }

    if (erros.length > 0) {
        throw new AppError('Dados inválidos.', 400, erros);
    }
}

function validarId(id) {
    id = Number(id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('ID inválido.', 400);
    }

    return id;
}

async function listarAdmin() {
    return await activityServiceRepository.listarAdmin();
}

async function listarPublicos() {
    return await activityServiceRepository.listarPublicos();
}

async function buscarPorId(id) {
    id = validarId(id);

    const atividade = await activityServiceRepository.buscarPorId(id);

    if (!atividade) {
        throw new AppError('Atividade não encontrada.', 404);
    }

    return atividade;
}

async function criar(dados) {
    validar(dados);

    try {
        return await activityServiceRepository.criar({
            servico_id: Number(dados.servico_id),
            nome: dados.nome.trim()
        });
    } catch (erro) {
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new AppError('O serviço informado não existe.', 400);
        }

        throw erro;
    }
}

async function atualizar(id, dados) {
    id = validarId(id);

    await buscarPorId(id);

    validar(dados);

    try {
        await activityServiceRepository.atualizar(id, {
            servico_id: Number(dados.servico_id),
            nome: dados.nome.trim()
        });
    } catch (erro) {
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new AppError('O serviço informado não existe.', 400);
        }

        throw erro;
    }
}

async function desativar(id) {
    id = validarId(id);

    await buscarPorId(id);

    return await activityServiceRepository.desativar(id);
}

module.exports = {
    listarAdmin,
    listarPublicos,
    buscarPorId,
    criar,
    atualizar,
    desativar
};