const horarioFuncionamentoRepository = require('../repositories/horarioFuncionamentoRepository');
const AppError = require('../utils/appError');

function validarDados(dados) {
    const { dia_semana, hora_inicio, hora_fim, observacao } = dados;

    if (
        !Number.isInteger(Number(dia_semana)) ||
        Number(dia_semana) < 0 ||
        Number(dia_semana) > 6
    ) {
        throw new AppError('Dia da semana inválido. Informe um valor entre 0 e 6.', 400);
    }

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!formatoHora.test(hora_inicio) || !formatoHora.test(hora_fim)) {
        throw new AppError('Informe horários válidos no formato HH:MM ou HH:MM:SS.', 400);
    }

    if (hora_fim <= hora_inicio) {
        throw new AppError('O horário de encerramento deve ser posterior ao horário de início.', 400);
    }

    if (observacao !== undefined && observacao !== null) {
        if (typeof observacao !== 'string' || observacao.length > 150) {
            throw new AppError('A observação deve ter no máximo 150 caracteres.', 400);
        }
    }
}

function tratarErroBanco(erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
        throw new AppError('Já existe um horário cadastrado para esse dia e horário de início.', 409);
    }

    throw erro;
}

async function listarPublicos() {
    return await horarioFuncionamentoRepository.listarPublicos();
}

async function listarAdmin() {
    return await horarioFuncionamentoRepository.listarAdmin();
}

async function buscarPorId(id) {
    const horario = await horarioFuncionamentoRepository.buscarPorId(id);

    if (!horario) {
        throw new AppError('Horário de funcionamento não encontrado.', 404);
    }

    return horario;
}

async function criar(dados) {
    validarDados(dados);

    try {
        return await horarioFuncionamentoRepository.criar(dados);
    } catch (erro) {
        tratarErroBanco(erro);
    }
}

async function atualizar(id, dados) {
    await buscarPorId(id);
    validarDados(dados);

    try {
        await horarioFuncionamentoRepository.atualizar(id, dados);
    } catch (erro) {
        tratarErroBanco(erro);
    }
}

async function desativar(id) {
    await buscarPorId(id);

    return await horarioFuncionamentoRepository.desativar(id);
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    criar,
    atualizar,
    desativar
};