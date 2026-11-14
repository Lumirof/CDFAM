const serviceHorarioRepository = require('../repositories/serviceHorarioRepository');
const AppError = require('../utils/appError');

function paraId(valor) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('ID inválido.', 400);
    }

    return id;
}

function validar(dados) {
    const erros = [];

    if (!Number.isInteger(Number(dados.servico_id)) ||
        Number(dados.servico_id) <= 0) {
        erros.push('Selecione um serviço válido.');
    }

    if (
        dados.atividade_id !== null &&
        dados.atividade_id !== undefined &&
        dados.atividade_id !== '' &&
        (!Number.isInteger(Number(dados.atividade_id)) ||
            Number(dados.atividade_id) <= 0)
    ) {
        erros.push('Selecione uma atividade válida.');
    }

    const dia = Number(dados.dia_semana);

    if (
        dados.dia_semana === undefined ||
        dados.dia_semana === null ||
        dados.dia_semana === '' ||
        !Number.isInteger(dia) ||
        dia < 0 ||
        dia > 6
    ) {
        erros.push('O dia da semana deve estar entre 0 e 6.');
    }

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!dados.hora_inicio || !formatoHora.test(dados.hora_inicio)) {
        erros.push('Informe um horário de início válido.');
    }

    if (
        dados.hora_fim !== null &&
        dados.hora_fim !== undefined &&
        dados.hora_fim !== '' &&
        !formatoHora.test(dados.hora_fim)
    ) {
        erros.push('Informe um horário de fim válido.');
    }

    if (dados.hora_fim) {
        if (dados.hora_inicio && dados.hora_fim <= dados.hora_inicio) {
            erros.push('O horário de fim deve ser posterior ao horário de início.');
        }
    }

    if (
        dados.observacao !== null &&
        dados.observacao !== undefined &&
        String(dados.observacao).length > 150
    ) {
        erros.push('A observação deve ter no máximo 150 caracteres.');
    }

    if (erros.length > 0) {
        throw new AppError('Dados inválidos.', 400, erros);
    }
}

function tratarErroBanco(erro) {
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError(
            'O serviço ou a atividade informada não existe ou não pertence ao serviço selecionado.',
            400
        );
    }

    if (erro.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        throw new AppError('Os dados informados não respeitam as regras do horário.', 400);
    }

    throw erro;
}

async function listarAdmin() {
    return await serviceHorarioRepository.listarAdmin();
}

async function listarPublicos() {
    return await serviceHorarioRepository.listarPublicos();
}

async function buscarPorId(id) {
    id = paraId(id);

    const horario = await serviceHorarioRepository.buscarPorId(id);

    if (!horario) {
        throw new AppError('Horário não encontrado.', 404);
    }

    return horario;
}

async function criar(dados) {
    validar(dados);

    try {
        return await serviceHorarioRepository.criar({
            ...dados,
            servico_id: Number(dados.servico_id),
            atividade_id: dados.atividade_id || null,
            dia_semana: Number(dados.dia_semana),
            hora_fim: dados.hora_fim || null,
            observacao: dados.observacao || null
        });
    } catch (erro) {
        tratarErroBanco(erro);
    }
}

async function atualizar(id, dados) {
    id = paraId(id);

    const horarioAtual = await buscarPorId(id);

    const dadosAtualizados = {
        servico_id: dados.servico_id ?? horarioAtual.servico_id,
        atividade_id: dados.atividade_id !== undefined
            ? dados.atividade_id
            : horarioAtual.atividade_id,
        dia_semana: dados.dia_semana ?? horarioAtual.dia_semana,
        hora_inicio: dados.hora_inicio ?? horarioAtual.hora_inicio,
        hora_fim: dados.hora_fim !== undefined
            ? dados.hora_fim
            : horarioAtual.hora_fim,
        observacao: dados.observacao !== undefined
            ? dados.observacao
            : horarioAtual.observacao
    };

    validar(dadosAtualizados);

    try {
        await serviceHorarioRepository.atualizar(id, {
            ...dadosAtualizados,
            servico_id: Number(dadosAtualizados.servico_id),
            atividade_id: dadosAtualizados.atividade_id || null,
            dia_semana: Number(dadosAtualizados.dia_semana),
            hora_fim: dadosAtualizados.hora_fim || null,
            observacao: dadosAtualizados.observacao || null
        });
    } catch (erro) {
        tratarErroBanco(erro);
    }
}

async function remover(id) {
    id = paraId(id);

    await buscarPorId(id);

    return await serviceHorarioRepository.excluir(id);
}

module.exports = {
    listarAdmin,
    listarPublicos,
    buscarPorId,
    criar,
    atualizar,
    remover
};