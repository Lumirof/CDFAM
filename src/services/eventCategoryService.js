const AppError = require('../utils/appError');
const repo = require('../repositories/eventCategoryRepository');

const REGEX_COR = /^#[0-9A-Fa-f]{6}$/;
const CAMPOS = ['nome', 'cor'];

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

function normalizar(d) {
  const cor = typeof d.cor === 'string' ? d.cor.trim() : d.cor;
  return {
    nome: typeof d.nome === 'string' ? d.nome.trim() : d.nome,
    cor: cor ? (typeof cor === 'string' ? cor.toUpperCase() : cor) : null,
  };
}

function validar(d) {
  const erros = [];

  if (!d.nome || typeof d.nome !== 'string') erros.push('nome é obrigatório.');
  else if (d.nome.length > 80) erros.push('nome deve ter no máximo 80 caracteres.');
  if (d.cor !== null && !(typeof d.cor === 'string' && REGEX_COR.test(d.cor))) {
    erros.push('cor deve estar no formato hexadecimal #RRGGBB (ex.: #E63946).');
  }

  if (erros.length) throw new AppError('Dados inválidos.', 400, erros);
}

function traduzirErroDb(err) {
  switch (err.code) {
    case 'ER_ROW_IS_REFERENCED_2':
      return new AppError('Não é possível excluir: existem eventos vinculados a esta categoria.', 409);
    default:
      return err;
  }
}

async function garantirNomeUnico(nome, ignorarId) {
  if (await repo.buscarPorNome(nome, ignorarId)) {
    throw new AppError('Já existe uma categoria de evento com esse nome.', 409);
  }
}

async function listar(query = {}) {
  const busca = typeof query.busca === 'string' && query.busca.trim() ? query.busca.trim() : undefined;
  return repo.listar({ busca });
}

async function buscarPorId(valor) {
  const categoria = await repo.buscarPorId(paraId(valor));
  if (!categoria) throw new AppError('Categoria de evento não encontrada.', 404);
  return categoria;
}

async function criar(entrada) {
  const dados = normalizar(filtrarCampos(entrada));
  validar(dados);
  await garantirNomeUnico(dados.nome);

  const id = await repo.criar(dados);
  return buscarPorId(id);
}

async function atualizar(valor, entrada) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Categoria de evento não encontrada.', 404);

  const dados = normalizar({ ...filtrarCampos(existente), ...filtrarCampos(entrada) });
  validar(dados);
  await garantirNomeUnico(dados.nome, id);

  await repo.atualizar(id, dados);
  return buscarPorId(id);
}

async function remover(valor) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Categoria de evento não encontrada.', 404);

  try {
    await repo.remover(id);
  } catch (err) {
    throw traduzirErroDb(err);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};