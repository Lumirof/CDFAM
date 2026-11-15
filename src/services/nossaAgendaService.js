const AppError = require('../utils/appError');
const nossaAgendaRepository = require('../repositories/nossaAgendaRepository');

function paraId(id) {
    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw new AppError('ID do mapa de agendamento inválido.', 400);
    }
    return numero;
}

function normalizar(entrada) {
    if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
        throw new AppError('Os dados do mapa de agendamento são obrigatórios.', 400);
    }

    const titulo = typeof entrada.titulo === 'string'
        ? entrada.titulo.trim()
        : '';

    if (!titulo) {
        throw new AppError('O título do mapa é obrigatório.', 400);
    }

    if (titulo.length > 200) {
        throw new AppError('O título deve ter no máximo 200 caracteres.', 400);
    }

    const url = typeof entrada.url === 'string'
        ? entrada.url.trim()
        : '';

    if (!url) {
        throw new AppError('A URL do mapa é obrigatória.', 400);
    }

    if (url.length > 500) {
        throw new AppError('A URL deve ter no máximo 500 caracteres.', 400);
    }

    try {
        const endereco = new URL(url);

        if (!['http:', 'https:'].includes(endereco.protocol)) {
            throw new Error();
        }
    } catch {
        throw new AppError('A URL do mapa deve ser uma URL válida.', 400);
    }

    const valorPeriodo = entrada.periodo;

    if (valorPeriodo !== undefined && valorPeriodo !== null && typeof valorPeriodo !== 'string') {
        throw new AppError('O período deve ser um texto.', 400);
    }

    const periodo = typeof valorPeriodo === 'string' ? valorPeriodo.trim() : null;

    if (periodo && periodo.length > 50) {
        throw new AppError('O período deve ter no máximo 50 caracteres.', 400);
    }

    let vigente;

    if (entrada.vigente === undefined) {
        vigente = undefined;
    } else if (typeof entrada.vigente === 'boolean') {
        vigente = entrada.vigente;
    } else if (entrada.vigente === 0 || entrada.vigente === 1) {
        vigente = entrada.vigente === 1;
    } else {
        throw new AppError('O campo vigente deve ser verdadeiro ou falso.', 400);
    }

    return {
        titulo,
        url,
        periodo: periodo || null,
        vigente
    };
}

async function listarAdmin() {
    return await nossaAgendaRepository.listarAdmin();
}

async function buscarPorId(id) {
    const mapaId = paraId(id);

    const mapa = await nossaAgendaRepository.buscarPorId(mapaId);

    if (!mapa) {
        throw new AppError('Mapa de agendamento não encontrado.', 404);
    }
    return mapa;
}

async function buscarVigente() {
    const mapa = await nossaAgendaRepository.buscarVigente();

    if (!mapa) {
        throw new AppError('Nenhum mapa de agendamento vigente no momento.', 404);
    }
    return mapa;
}

async function criar(entrada, administradorId) {
    const dados = normalizar(entrada);

    dados.vigente = dados.vigente ?? false;
    dados.atualizado_por = administradorId;

    const id = await nossaAgendaRepository.criar(dados);
    return await buscarPorId(id);
}

async function atualizar(id, entrada, administradorId) {
    const mapaId = paraId(id);

    const existente = await buscarPorId(mapaId);

    const dados = normalizar(entrada);

    if (dados.vigente === undefined) {
        dados.vigente = Boolean(existente.vigente);
    }

    dados.atualizado_por = administradorId;

    await nossaAgendaRepository.atualizar(mapaId, dados);
    return await buscarPorId(mapaId);
}

async function excluir(id, confirmar) {
    const mapaId = paraId(id);

    const mapa = await buscarPorId(mapaId);

    if (mapa.vigente && !confirmar) {
        throw new AppError(
            'Este é o mapa vigente. Excluí-lo deixa o site sem mapa. Para confirmar, repita a requisição com ?confirmar=true.',
            409
        );
    }

    await nossaAgendaRepository.excluir(mapaId);
}

module.exports = {
    listarAdmin,
    buscarPorId,
    buscarVigente,
    criar,
    atualizar,
    excluir
};