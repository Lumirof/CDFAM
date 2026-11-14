const AppError = require('../utils/appError');
const repo = require('../repositories/eventRepository');

const STATUS = ['rascunho', 'publicada', 'despublicada', 'arquivada'];
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_DATA_HORA_ENTRADA = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;
const REGEX_DATA_HORA = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const CAMPOS = [
  'categoria_id', 'titulo', 'descricao', 'data_inicio', 'data_fim', 'dia_inteiro',
  'local', 'publico_alvo', 'noticia_id', 'status', 'destaque',
  'publicada_em', 'publicada_ate',
];
const PADRAO = { status: 'publicada', destaque: false, dia_inteiro: false };

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

function textoOuNulo(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto || null;
}

function normalizarDataHora(valor) {
  if (!valor) return null;
  if (typeof valor !== 'string') return valor;
  const m = valor.trim().match(REGEX_DATA_HORA_ENTRADA);
  if (!m) return valor;
  return `${m[1]} ${m[2] ?? '00'}:${m[3] ?? '00'}:${m[4] ?? '00'}`;
}

function dataValida(texto) {
  if (typeof texto !== 'string' || !REGEX_DATA.test(texto)) return false;
  const dt = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === texto;
}

function dataHoraValida(texto) {
  if (typeof texto !== 'string' || !REGEX_DATA_HORA.test(texto)) return false;
  const [data, hora] = texto.split(' ');
  const [h, mi, s] = hora.split(':').map(Number);
  return dataValida(data) && h < 24 && mi < 60 && s < 60;
}

function normalizar(d) {
  return {
    categoria_id: Number(d.categoria_id),
    titulo: typeof d.titulo === 'string' ? d.titulo.trim() : d.titulo,
    descricao: textoOuNulo(d.descricao),
    data_inicio: normalizarDataHora(d.data_inicio),
    data_fim: normalizarDataHora(d.data_fim),
    dia_inteiro: paraBooleano(d.dia_inteiro) ?? false,
    local: textoOuNulo(d.local),
    publico_alvo: textoOuNulo(d.publico_alvo),
    noticia_id: d.noticia_id ? Number(d.noticia_id) : null,
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
  else if (d.titulo.length > 200) erros.push('titulo deve ter no máximo 200 caracteres.');
  if (d.local && d.local.length > 150) erros.push('local deve ter no máximo 150 caracteres.');
  if (d.publico_alvo && d.publico_alvo.length > 150) erros.push('publico_alvo deve ter no máximo 150 caracteres.');
  if (d.noticia_id !== null && (!Number.isInteger(d.noticia_id) || d.noticia_id <= 0)) {
    erros.push('noticia_id deve ser um inteiro positivo ou nulo.');
  }
  if (!STATUS.includes(d.status)) erros.push(`status deve ser um de: ${STATUS.join(', ')}.`);

  let inicioOk = false;
  if (!d.data_inicio) erros.push('data_inicio é obrigatória.');
  else if (!dataHoraValida(d.data_inicio)) erros.push('data_inicio deve estar no formato AAAA-MM-DD ou AAAA-MM-DD HH:mm.');
  else inicioOk = true;

  let fimOk = false;
  if (d.data_fim) {
    if (!dataHoraValida(d.data_fim)) erros.push('data_fim deve estar no formato AAAA-MM-DD ou AAAA-MM-DD HH:mm.');
    else fimOk = true;
  }
  if (inicioOk && fimOk && d.data_fim < d.data_inicio) {
    erros.push('data_fim não pode ser anterior a data_inicio.');
  }

  if (d.publicada_em && !dataValida(d.publicada_em)) erros.push('publicada_em deve estar no formato AAAA-MM-DD.');
  if (d.publicada_ate && !dataValida(d.publicada_ate)) erros.push('publicada_ate deve estar no formato AAAA-MM-DD.');
  if (dataValida(d.publicada_em) && dataValida(d.publicada_ate) && d.publicada_ate < d.publicada_em) {
    erros.push('publicada_ate não pode ser anterior a publicada_em.');
  }

  if (erros.length) throw new AppError('Dados inválidos.', 400, erros);
}

function traduzirErroDb(err) {
  switch (err.code) {
    case 'ER_NO_REFERENCED_ROW_2':
      return new AppError('A categoria ou a notícia informada não existe.', 400);
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      return new AppError('Os dados violam uma regra do banco (verifique as datas).', 400);
    default:
      return err;
  }
}

function paraDataFiltro(valor, nome) {
  if (valor === undefined || valor === '') return undefined;
  if (!dataValida(valor)) throw new AppError(`${nome} deve estar no formato AAAA-MM-DD.`, 400);
  return valor;
}

async function listarComFiltros(query, somentePublicos) {
  const { pagina, limite, deslocamento } = paraPaginacao(query);

  if (query.status && !STATUS.includes(query.status)) {
    throw new AppError(`status deve ser um de: ${STATUS.join(', ')}.`, 400);
  }

  const de = paraDataFiltro(query.de, 'de');
  const ate = paraDataFiltro(query.ate, 'ate');

  const filtros = {
    somentePublicos,
    status: somentePublicos ? undefined : query.status,
    categoriaId: query.categoria ? paraId(query.categoria) : undefined,
    destaque: paraBooleano(query.destaque),
    busca: typeof query.busca === 'string' && query.busca.trim() ? query.busca.trim() : undefined,
    de: de ? `${de} 00:00:00` : undefined,
    ate: ate ? `${ate} 23:59:59` : undefined,
  };

  const { itens, total } = await repo.listar(filtros, { limite, deslocamento });
  return {
    itens,
    paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
  };
}

const listarPublicos = (query) => listarComFiltros(query, true);
const listarAdmin = (query) => listarComFiltros(query, false);

async function buscarPublicoPorId(valor) {
  const evento = await repo.buscarPublicoPorId(paraId(valor));
  if (!evento) throw new AppError('Evento não encontrado.', 404);
  return evento;
}

async function buscarPorId(valor) {
  const evento = await repo.buscarPorId(paraId(valor));
  if (!evento) throw new AppError('Evento não encontrado.', 404);
  return evento;
}

const listarCategorias = () => repo.listarCategorias();

async function criar(entrada, adminId) {
  const dados = normalizar({ ...PADRAO, ...filtrarCampos(entrada) });
  validar(dados);

  try {
    const id = await repo.criar({ ...dados, atualizado_por: adminId ?? null });
    return await buscarPorId(id);
  } catch (err) {
    throw traduzirErroDb(err);
  }
}

async function atualizar(valor, entrada, adminId) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Evento não encontrado.', 404);

  const dados = normalizar({ ...filtrarCampos(existente), ...filtrarCampos(entrada) });
  validar(dados);

  try {
    await repo.atualizar(id, { ...dados, atualizado_por: adminId ?? null });
  } catch (err) {
    throw traduzirErroDb(err);
  }
  return buscarPorId(id);
}

async function remover(valor) {
  const id = paraId(valor);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new AppError('Evento não encontrado.', 404);
  await repo.remover(id);
}

module.exports = {
  listarPublicos,
  listarAdmin,
  buscarPublicoPorId,
  buscarPorId,
  listarCategorias,
  criar,
  atualizar,
  remover,
};