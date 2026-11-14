const AppError = require('../utils/appError');
const serviceRepository = require('../repositories/serviceRepository');

function paraId(id) {
    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw new AppError('ID do serviço inválido.', 400);
    }
    return numero;
}

function normalizar(entrada) {
    if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
        throw new AppError('Os dados do serviço são obrigatórios.', 400);
    }

    const nome = typeof entrada.nome === 'string'
        ? entrada.nome.trim()
        : '';

    if (!nome) {
        throw new AppError('O nome do serviço é obrigatório.', 400);
    }

    if (nome.length > 150) {
        throw new AppError('O nome deve ter no máximo 150 caracteres.', 400);
    }

    const camposTexto = [
        ['realizado_por', 400],
        ['publico_alvo', 150],
        ['local', 150],
        ['como_ser_atendido', 300],
        ['link_titulo', 150],
        ['link_url', 500]
    ];

    const dados = { nome };

    for (const [campo, limite] of camposTexto) {
        const valor = entrada[campo];

        if (valor !== undefined && valor !== null && typeof valor !== 'string') {
            throw new AppError(`O campo ${campo} deve ser um texto.`, 400);
        }

        const texto = typeof valor === 'string' ? valor.trim() : null;

        if (texto && texto.length > limite) {
            throw new AppError(
                `O campo ${campo} deve ter no máximo ${limite} caracteres.`,
                400
            );
        }

        dados[campo] = texto || null;
    }

    if (entrada.descricao !== undefined &&
        entrada.descricao !== null &&
        typeof entrada.descricao !== 'string') {
        throw new AppError('A descrição deve ser um texto.', 400);
    }

    dados.descricao = typeof entrada.descricao === 'string'
        ? entrada.descricao.trim() || null
        : null;

    const ordem = entrada.ordem === undefined ? 0 : Number(entrada.ordem);

    if (!Number.isInteger(ordem) || ordem < 0) {
        throw new AppError('A ordem deve ser um número inteiro igual ou maior que zero.', 400);
    }

    dados.ordem = ordem;

    if (dados.link_url) {
        try {
            const url = new URL(dados.link_url);

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error();
            }
        } catch {
            throw new AppError('O link do serviço deve ser uma URL válida.', 400);
        }
    }
    return dados;
}

async function listarPublicos() {
    return await serviceRepository.listarPublicos();
}

async function listarAdmin() {
    return await serviceRepository.listarAdmin();
}

async function buscarPorId(id) {
    const servicoId = paraId(id);

    const servico = await serviceRepository.buscarPorId(servicoId);

    if (!servico) {
        throw new AppError('Serviço não encontrado.', 404);
    }
    return servico;
}

async function criar(entrada, administradorId) {
    const dados = normalizar(entrada);

    dados.atualizado_por = administradorId;

    const id = await serviceRepository.criar(dados);
    return await buscarPorId(id);
}

async function atualizar(id, entrada, administradorId) {
    const servicoId = paraId(id);

    await buscarPorId(servicoId);

    const dados = normalizar(entrada);

    dados.atualizado_por = administradorId;

    await serviceRepository.atualizar(servicoId, dados);
    return await buscarPorId(servicoId);
}

async function desativar(id) {
    const servicoId = paraId(id);

    const servico = await buscarPorId(servicoId);

    if (!servico.ativo) {
        throw new AppError('Este serviço já está desativado.', 400);
    }
    await serviceRepository.desativar(servicoId);
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    criar,
    atualizar,
    desativar
};