const AppError = require('../utils/appError');
const slugify = require('../utils/slugify');
const repo = require('../repositories/noticeRepository');

const STATUS = ['rascunho', 'publicada', 'despublicada', 'arquivada'];
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const CAMPOS = [
  'categoria_id', 'titulo', 'slug', 'resumo', 'conteudo',
  'status', 'destaque', 'publicada_em', 'publicada_ate',
];
const PADRAO = { status: 'rascunho', destaque: false };

function paraId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID inválido.', 400);
  return id;
}

function paraBooleano(valor) {
  if (valor === undefined || valor === '') return undefined;
  return valor === true || valor === 'true' || valor === '1' || valor === 1;
}

function paraPaginacao({ pagina, limite }) {
  const p = Math.max(parseInt(pagina, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limite, 10) || 10, 1), 50);
  return { pagina: p, limite: l, deslocamento: (p - 1) * l };
}

function filtrarCampos(obj) {
  const resultado = {};
  for (const campo of CAMPOS) {
    if (obj[campo] !== undefined) resultado[campo] = obj[campo];
  }
  return resultado;
}

function normalizar(d) {
  return {
    categoria_id: Number(d.categoria_id),
    titulo: typeof d.titulo === 'string' ? d.titulo.trim() : d.titulo,
    slug: slugify(d.slug || d.titulo || ''),
    resumo: d.resumo ? String(d.resumo).trim() : null,
    conteudo: typeof d.conteudo === 'string' ? d.conteudo.trim() : d.conteudo,
    status: d.status,
    destaque: paraBooleano(d.destaque) ?? false,
    publicada_em: d.publicada_em || null,
    publicada_ate: d.publicada_ate || null,
  };
}

function validar(d) {
  const erros = [];

  if (!Number.isInteger(d.categoria_id) || d.categoria_id <= 0) erros.push('categoria_id deve ser um inteiro positivo.');
  if (!d.titulo) erros.push('titulo é obrigatório.');
  else if (d.titulo.length > 250) erros.push('titulo deve ter no máximo 250 caracteres.');
  if (!d.slug) erros.push('slug não pôde ser gerado; informe um titulo ou slug válido.');
  if (!d.conteudo) erros.push('conteudo é obrigatório.');
  if (d.resumo && d.resumo.length > 400) erros.push('resumo deve ter no máximo 400 caracteres.');
  if (!STATUS.includes(d.status)) erros.push(`status deve ser um de: ${STATUS.join(', ')}.`);
  if (d.publicada_em && !REGEX_DATA.test(d.publicada_em)) erros.push('publicada_em deve estar no formato AAAA-MM-DD.');
  if (d.publicada_ate && !REGEX_DATA.test(d.publicada_ate)) erros.push('publicada_ate deve estar no formato AAAA-MM-DD.');
  if (d.publicada_em && d.publicada_ate && d.publicada_ate < d.publicada_em) {
    erros.push('publicada_ate não pode ser anterior a publicada_em.');
  }

  if (erros.length) throw new AppError('Dados inválidos.', 400, erros);
}

function traduzirErroDb(err) {
  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return new AppError('Já existe uma notícia com esse slug.', 409);
    case 'ER_NO_REFERENCED_ROW_2':
      return new AppError('A categoria informada não existe.', 400);
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      return new AppError('Os dados violam uma regra do banco (verifique as datas).', 400);
    default:
      return err;
  }
}

async function listarComFiltros(query, somentePublicas) {
  const { pagina, limite, deslocamento } = paraPaginacao(query);

  if (query.status && !STATUS.includes(query.status)) {
    throw new AppError(`status deve ser um de: ${STATUS.join(', ')}.`, 400);
  }

  const filtros = {
    somentePublicas,
    status: somentePublicas ? undefined : query.status,
    categoriaId: query.categoria ? paraId(query.categoria) : undefined,
    destaque: paraBooleano(query.destaque),
    busca: typeof query.busca === 'string' && query.busca.trim() ? query.busca.trim() : undefined,
  };

  const { itens, total } = await repo.listar(filtros, { limite, deslocamento });
  return {
    itens,
    paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
  };
}

const listarPublicas = (query) => listarComFiltros(query, true);
const listarAdmin = (query) => listarComFiltros(query, false);

async function buscarPublicaPorSlug(slug) {
  const noticia = await repo.buscarPublicaPorSlug(String(slug));
  if (!noticia) throw new AppError('Notícia não encontrada.', 404);
  noticia.imagens = await repo.listarImagens(noticia.id);
  return noticia;
}

async function buscarPorId(valor) {
  const id = paraId(valor);
  const noticia = await repo.buscarPorId(id);
  if (!noticia) throw new AppError('Notícia não encontrada.', 404);
  noticia.imagens = await repo.listarImagens(id);
  return noticia;
}

async function criar(entrada, autorId) {
  const dados = normalizar({ ...PADRAO, ...filtrarCampos(entrada) });
  validar(dados);

  try {
    const id = await repo.criar({ ...dados, autor_id: autorId ?? null });
    return await buscarPorId(id);
  } catch (err) {
    throw traduzirErroDb(err);
  }
}

async function atualizar(valor, entrada) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Notícia não encontrada.', 404);

  const dados = normalizar({ ...filtrarCampos(existente), ...filtrarCampos(entrada) });
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
  if (!existente) throw new AppError('Notícia não encontrada.', 404);
  await repo.remover(id);
}

module.exports = {
  listarPublicas,
  listarAdmin,
  buscarPublicaPorSlug,
  buscarPorId,
  criar,
  atualizar,
  remover,
};