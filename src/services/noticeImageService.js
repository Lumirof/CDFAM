const AppError = require('../utils/AppError');
const repo = require('../repositories/noticeImageRepository');

const CAMPOS = ['noticia_id', 'arquivo_url', 'texto_alt', 'legenda', 'ordem'];

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

function normalizar(d) {
  return {
    noticia_id: Number(d.noticia_id),
    arquivo_url: typeof d.arquivo_url === 'string' ? d.arquivo_url.trim() : d.arquivo_url,
    texto_alt: typeof d.texto_alt === 'string' ? d.texto_alt.trim() : d.texto_alt,
    legenda: textoOuNulo(d.legenda),
    ordem: d.ordem === undefined || d.ordem === null || d.ordem === '' ? null : Number(d.ordem),
  };
}

function urlValida(texto) {
  if (texto.startsWith('/')) return true;
  try {
    return ['http:', 'https:'].includes(new URL(texto).protocol);
  } catch {
    return false;
  }
}

function validar(d) {
  const erros = [];

  if (!Number.isInteger(d.noticia_id) || d.noticia_id <= 0) erros.push('noticia_id deve ser um inteiro positivo.');

  if (!d.arquivo_url || typeof d.arquivo_url !== 'string') erros.push('arquivo_url é obrigatório.');
  else if (d.arquivo_url.length > 500) erros.push('arquivo_url deve ter no máximo 500 caracteres.');
  else if (!urlValida(d.arquivo_url)) erros.push('arquivo_url deve ser uma URL http(s) válida ou um caminho iniciado por "/".');

  if (!d.texto_alt || typeof d.texto_alt !== 'string') erros.push('texto_alt é obrigatório (descrição da imagem para acessibilidade).');
  else if (d.texto_alt.length > 250) erros.push('texto_alt deve ter no máximo 250 caracteres.');

  if (d.legenda && d.legenda.length > 250) erros.push('legenda deve ter no máximo 250 caracteres.');

  if (d.ordem !== null && (!Number.isInteger(d.ordem) || d.ordem < 0)) {
    erros.push('ordem deve ser um inteiro igual ou maior que zero.');
  }

  if (erros.length) throw new AppError('Dados inválidos.', 400, erros);
}

function traduzirErroDb(err) {
  switch (err.code) {
    case 'ER_NO_REFERENCED_ROW_2':
      return new AppError('A notícia informada não existe.', 400);
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      return new AppError('O texto alternativo não pode ficar em branco.', 400);
    default:
      return err;
  }
}

async function listarPublicas(query = {}) {
  return repo.listar({
    noticiaId: query.noticia_id ? paraId(query.noticia_id) : undefined,
    somentePublicas: true,
  });
}

async function listarAdmin(query = {}) {
  return repo.listar({ noticiaId: query.noticia_id ? paraId(query.noticia_id) : undefined });
}

async function buscarPorId(valor) {
  const imagem = await repo.buscarPorId(paraId(valor));
  if (!imagem) throw new AppError('Imagem não encontrada.', 404);
  return imagem;
}

async function criar(entrada) {
  const dados = normalizar(filtrarCampos(entrada));
  validar(dados);

  try {
    if (dados.ordem === null) dados.ordem = await repo.proximaOrdem(dados.noticia_id);
    const id = await repo.criar(dados);
    return await buscarPorId(id);
  } catch (err) {
    throw traduzirErroDb(err);
  }
}

async function atualizar(valor, entrada) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Imagem não encontrada.', 404);

  const dados = normalizar({
    ...filtrarCampos(existente),
    ...filtrarCampos(entrada),
    noticia_id: existente.noticia_id,
  });
  validar(dados);

  try {
    await repo.atualizar(id, dados);
  } catch (err) {
    throw traduzirErroDb(err);
  }
  return buscarPorId(id);
}

async function remover(valor) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Imagem não encontrada.', 404);
  await repo.remover(id);
}

module.exports = {
  listarPublicas,
  listarAdmin,
  buscarPorId,
  criar,
  atualizar,
  remover,
};