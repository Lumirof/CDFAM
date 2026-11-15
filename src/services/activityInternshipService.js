const AppError = require('../utils/appError');
const activityInternshipRepository = require('../repositories/activityInternshipRepository');


const MODALIDADES = ['pratica_assistida', 'estagio_internato', 'residencia'];

function paraId(id) {
    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw new AppError('ID da atividade de estágio inválido.', 400);
    }
    return numero;
}

function validarModalidadeFiltro(modalidade) {
    if (modalidade === undefined || modalidade === '') {
        return undefined;
    }

    if (!MODALIDADES.includes(modalidade)) {
        throw new AppError(
            `Modalidade inválida. Use: ${MODALIDADES.join(', ')}.`,
            400
        );
    }
    return modalidade;
}

function normalizar(entrada) {
    if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
        throw new AppError('Os dados da atividade de estágio são obrigatórios.', 400);
    }

    const erros = [];

    if (!MODALIDADES.includes(entrada.modalidade)) {
        erros.push(`A modalidade é obrigatória. Use: ${MODALIDADES.join(', ')}.`);
    }

    const curso = typeof entrada.curso === 'string' ? entrada.curso.trim() : '';

    if (!curso) {
        erros.push('O curso é obrigatório.');
    } else if (curso.length > 200) {
        erros.push('O curso deve ter no máximo 200 caracteres.');
    }

   
    const descricao = typeof entrada.descricao === 'string' ? entrada.descricao.trim() : '';

    if (!descricao) {
        erros.push('A descrição é obrigatória.');
    } else if (descricao.length > 5000) {
        erros.push('A descrição deve ter no máximo 5000 caracteres.');
    }

    const ordem = entrada.ordem === undefined ? 0 : Number(entrada.ordem);

    if (!Number.isInteger(ordem) || ordem < 0) {
        erros.push('A ordem deve ser um número inteiro igual ou maior que zero.');
    }

    if (erros.length > 0) {
        throw new AppError('Dados inválidos.', 400, erros);
    }

    return {
        modalidade: entrada.modalidade,
        curso,
        descricao,
        ordem
    };
}

async function listarPublicos(modalidade) {
    return await activityInternshipRepository.listarPublicos(
        validarModalidadeFiltro(modalidade)
    );
}

async function listarAdmin(modalidade) {
    return await activityInternshipRepository.listarAdmin(
        validarModalidadeFiltro(modalidade)
    );
}

async function buscarPorId(id) {
    const atividadeId = paraId(id);

    const atividade = await activityInternshipRepository.buscarPorId(atividadeId);

    if (!atividade) {
        throw new AppError('Atividade de estágio não encontrada.', 404);
    }
    return atividade;
}


async function buscarPublicoPorId(id) {
    const atividade = await buscarPorId(id);

    if (!atividade.ativa) {
        throw new AppError('Atividade de estágio não encontrada.', 404);
    }
    return atividade;
}

async function criar(entrada, administradorId) {
    const dados = normalizar(entrada);

    dados.atualizado_por = administradorId;

    const id = await activityInternshipRepository.criar(dados);
    return await buscarPorId(id);
}

async function atualizar(id, entrada, administradorId) {
    const atividadeId = paraId(id);

    await buscarPorId(atividadeId);

    const dados = normalizar(entrada);

    dados.atualizado_por = administradorId;

    await activityInternshipRepository.atualizar(atividadeId, dados);
    return await buscarPorId(atividadeId);
}

async function desativar(id) {
    const atividadeId = paraId(id);

    const atividade = await buscarPorId(atividadeId);

    if (!atividade.ativa) {
        throw new AppError('Esta atividade de estágio já está desativada.', 400);
    }

    await activityInternshipRepository.desativar(atividadeId);
}

module.exports = {
    MODALIDADES,
    listarPublicos,
    listarAdmin,
    buscarPorId,
    buscarPublicoPorId,
    criar,
    atualizar,
    desativar
};