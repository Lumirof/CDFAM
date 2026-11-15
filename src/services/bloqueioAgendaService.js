const bloqueioAgendaRepository = require('../repositories/bloqueioAgendaRepository');
const AppError = require('../utils/AppError');

const TIPOS_VALIDOS = ['feriado', 'manutencao', 'outro'];

function validarDados(dados) {
    const {
        servico_id,
        tipo,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        motivo
    } = dados;

    if (
        servico_id !== undefined &&
        servico_id !== null &&
        servico_id !== '' &&
        (!Number.isInteger(Number(servico_id)) || Number(servico_id) <= 0)
    ) {
        throw new AppError('Serviço informado inválido.', 400);
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
        throw new AppError('Tipo de bloqueio inválido.', 400);
    }

    const formatoData = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoData.test(data_inicio)) {
        throw new AppError('Informe uma data inicial válida no formato AAAA-MM-DD.', 400);
    }

    if (data_fim && !formatoData.test(data_fim)) {
        throw new AppError('Informe uma data final válida no formato AAAA-MM-DD.', 400);
    }

    if (data_fim && data_fim < data_inicio) {
        throw new AppError('A data final não pode ser anterior à data inicial.', 400);
    }

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    const inicioPreenchido = hora_inicio !== undefined && hora_inicio !== null && hora_inicio !== '';
    const fimPreenchido = hora_fim !== undefined && hora_fim !== null && hora_fim !== '';

    if (inicioPreenchido !== fimPreenchido) {
        throw new AppError('Informe os horários de início e fim juntos.', 400);
    }

    if (inicioPreenchido) {
        if (!formatoHora.test(hora_inicio) || !formatoHora.test(hora_fim)) {
            throw new AppError('Informe horários válidos no formato HH:MM ou HH:MM:SS.', 400);
        }

        if (hora_fim <= hora_inicio) {
            throw new AppError('O horário final deve ser posterior ao horário inicial.', 400);
        }
    }

    if (motivo !== undefined && motivo !== null) {
        if (typeof motivo !== 'string' || motivo.length > 200) {
            throw new AppError('O motivo deve ter no máximo 200 caracteres.', 400);
        }
    }
}

function tratarErroBanco(erro) {
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('O serviço ou administrador informado não existe.', 400);
    }

    throw erro;
}

async function listarPublicos() {
    return await bloqueioAgendaRepository.listarPublicos();
}

async function listarAdmin() {
    return await bloqueioAgendaRepository.listarAdmin();
}

async function buscarPorId(id) {
    const bloqueio = await bloqueioAgendaRepository.buscarPorId(id);

    if (!bloqueio) {
        throw new AppError('Bloqueio de agenda não encontrado.', 404);
    }

    return bloqueio;
}

async function criar(dados) {
    validarDados(dados);

    try {
        return await bloqueioAgendaRepository.criar(dados);
    } catch (erro) {
        tratarErroBanco(erro);
    }
}

async function atualizar(id, dados) {
    await buscarPorId(id);
    validarDados(dados);

    try {
        await bloqueioAgendaRepository.atualizar(id, dados);
    } catch (erro) {
        tratarErroBanco(erro);
    }
}

async function excluir(id) {
    await buscarPorId(id);

    return await bloqueioAgendaRepository.excluir(id);
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    criar,
    atualizar,
    excluir
};