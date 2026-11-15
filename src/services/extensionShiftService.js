const AppError = require('../utils/appError');
const acaoRepo = require('../repositories/extensionRepository');
const repo = require('../repositories/extensionShiftRepository');

const TURNOS = ['manha', 'tarde'];
const CAMPOS = ['dia_semana', 'turno', 'observacao'];

function paraId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID inválido.', 400);
  return id;
}

function filtrarCampos(obj = {}) {
  const resultado = {};
  for (const campo of CAMPOS) {
    if (obj[campo] !== undefined) resultado[campo] = obj[campo];
  }
  return resultado;
}

function textoOuNulo(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto || null;
}

function numeroOuNulo(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  return Number(valor);
}

function normalizar(d) {
  return {
    dia_semana: numeroOuNulo(d.dia_semana),
    turno: d.turno,
    observacao: textoOuNulo(d.observacao),
  };
}

function validar(d) {
  const erros = [];

  if (d.dia_semana === null) erros.push('dia_semana é obrigatório (0 = domingo ... 6 = sábado).');
  else if (!Number.isInteger(d.dia_semana) || d.dia_semana < 0 || d.dia_semana > 6) {
    erros.push('dia_semana deve ser um inteiro de 0 (domingo) a 6 (sábado).');
  }
  if (!TURNOS.includes(d.turno)) erros.push(`turno deve ser um de: ${TURNOS.join(', ')}.`);
  if (d.observacao && d.observacao.length > 150) erros.push('observacao deve ter no máximo 150 caracteres.');

  if (erros.length) throw new AppError('Dados inválidos.', 400, erros);
}

function traduzirErroDb(err) {
  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return new AppError('Já existe esse turno (dia da semana e turno) para esta atividade.', 409);
    case 'ER_NO_REFERENCED_ROW_2':
      return new AppError('Atividade de extensão não encontrada.', 404);
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      return new AppError('Os dados violam uma regra do banco (verifique os valores).', 400);
    default:
      return err;
  }
}

async function garantirAcao(valor) {
  const id = paraId(valor);
  const acao = await acaoRepo.buscarPorId(id);
  if (!acao) throw new AppError('Atividade de extensão não encontrada.', 404);
  return acao;
}

async function listarPorAcao(valorAcaoId) {
  const acao = await garantirAcao(valorAcaoId);
  return repo.listarPorAcao(acao.id);
}

async function criar(valorAcaoId, entrada) {
  const acao = await garantirAcao(valorAcaoId);

  const dados = normalizar(filtrarCampos(entrada));
  validar(dados);

  try {
    const id = await repo.criar(acao.id, dados);
    return await repo.buscarPorId(id);
  } catch (err) {
    throw traduzirErroDb(err);
  }
}

async function atualizar(valor, entrada) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Turno não encontrado.', 404);

  const dados = normalizar({ ...filtrarCampos(existente), ...filtrarCampos(entrada) });
  validar(dados);

  try {
    await repo.atualizar(id, dados);
  } catch (err) {
    throw traduzirErroDb(err);
  }
  return repo.buscarPorId(id);
}

async function remover(valor) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Turno não encontrado.', 404);
  await repo.remover(id);
}

module.exports = {
  listarPorAcao,
  criar,
  atualizar,
  remover,
};
