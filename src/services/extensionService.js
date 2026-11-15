const AppError = require('../utils/appError');
const repo = require('../repositories/extensionRepository');
const turnosRepo = require('../repositories/extensionShiftRepository');

const ANO_MIN = 2000;
const ANO_MAX = 2100;

const CAMPOS = [
  'sigla', 'nome', 'codigo_prex', 'ano_referencia', 'coordenador_nome',
  'coordenador_lotacao', 'publico_alvo', 'atividades', 'como_buscar_atendimento',
  'local_atendimento', 'instagram_url', 'ordem', 'ativa',
];
const PADRAO = { ordem: 0, ativa: true };

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

function urlHttpValida(texto) {
  try {
    const u = new URL(texto);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizar(d) {
  return {
    sigla: textoOuNulo(d.sigla),
    nome: typeof d.nome === 'string' ? d.nome.trim() : d.nome,
    codigo_prex: textoOuNulo(d.codigo_prex),
    ano_referencia: numeroOuNulo(d.ano_referencia),
    coordenador_nome: typeof d.coordenador_nome === 'string' ? d.coordenador_nome.trim() : d.coordenador_nome,
    coordenador_lotacao: textoOuNulo(d.coordenador_lotacao),
    publico_alvo: textoOuNulo(d.publico_alvo),
    atividades: textoOuNulo(d.atividades),
    como_buscar_atendimento: textoOuNulo(d.como_buscar_atendimento),
    local_atendimento: textoOuNulo(d.local_atendimento),
    instagram_url: textoOuNulo(d.instagram_url),
    ordem: numeroOuNulo(d.ordem) ?? 0,
    ativa: paraBooleano(d.ativa) ?? true,
  };
}

function validar(d) {
  const erros = [];
  const max = (campo, tamanho) => {
    if (d[campo] && d[campo].length > tamanho) erros.push(`${campo} deve ter no máximo ${tamanho} caracteres.`);
  };

  if (typeof d.nome !== 'string' || !d.nome) erros.push('nome é obrigatório.');
  else max('nome', 250);

  if (typeof d.coordenador_nome !== 'string' || !d.coordenador_nome) erros.push('coordenador_nome é obrigatório.');
  else max('coordenador_nome', 150);

  if (d.ano_referencia === null) erros.push('ano_referencia é obrigatório.');
  else if (!Number.isInteger(d.ano_referencia) || d.ano_referencia < ANO_MIN || d.ano_referencia > ANO_MAX) {
    erros.push(`ano_referencia deve ser um ano entre ${ANO_MIN} e ${ANO_MAX}.`);
  }

  max('sigla', 30);
  max('codigo_prex', 30);
  max('coordenador_lotacao', 50);
  max('publico_alvo', 400);
  max('como_buscar_atendimento', 500);
  max('local_atendimento', 300);
  max('instagram_url', 300);

  if (d.instagram_url && !urlHttpValida(d.instagram_url)) {
    erros.push('instagram_url deve ser uma URL válida (http ou https).');
  }
  if (!Number.isInteger(d.ordem)) erros.push('ordem deve ser um número inteiro.');

  if (erros.length) throw new AppError('Dados inválidos.', 400, erros);
}

async function anexarTurnos(itens) {
  const turnos = await turnosRepo.listarDasAcoes(itens.map((i) => i.id));
  const porAcao = new Map();
  for (const t of turnos) {
    if (!porAcao.has(t.acao_id)) porAcao.set(t.acao_id, []);
    porAcao.get(t.acao_id).push({ id: t.id, dia_semana: t.dia_semana, turno: t.turno, observacao: t.observacao });
  }
  return itens.map((i) => ({ ...i, turnos: porAcao.get(i.id) || [] }));
}

function semDadosInternos({ atualizado_por, ...resto }) {
  return resto;
}

async function listarComFiltros(query, somentePublicas) {
  const { pagina, limite, deslocamento } = paraPaginacao(query);

  let ano;
  if (query.ano !== undefined && query.ano !== '') {
    ano = Number(query.ano);
    if (!Number.isInteger(ano)) throw new AppError('ano deve ser um número inteiro.', 400);
  }

  const filtros = {
    somentePublicas,
    ativa: somentePublicas ? undefined : paraBooleano(query.ativa),
    ano,
    busca: typeof query.busca === 'string' && query.busca.trim() ? query.busca.trim() : undefined,
  };

  const { itens, total } = await repo.listar(filtros, { limite, deslocamento });
  const comTurnos = await anexarTurnos(itens);

  return {
    itens: somentePublicas ? comTurnos.map(semDadosInternos) : comTurnos,
    paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
  };
}

const listarPublicas = (query) => listarComFiltros(query, true);
const listarAdmin = (query) => listarComFiltros(query, false);

async function garantirAcao(valor) {
  const id = paraId(valor);
  const acao = await repo.buscarPorId(id);
  if (!acao) throw new AppError('Atividade de extensão não encontrada.', 404);
  return acao;
}

async function buscarPorId(valor) {
  const acao = await garantirAcao(valor);
  acao.turnos = await turnosRepo.listarPorAcao(acao.id);
  return acao;
}

async function criar(entrada, adminId) {
  const dados = normalizar({ ...PADRAO, ...filtrarCampos(entrada) });
  validar(dados);

  const id = await repo.criar({ ...dados, atualizado_por: adminId ?? null });
  return buscarPorId(id);
}

async function atualizar(valor, entrada, adminId) {
  const existente = await garantirAcao(valor);

  const dados = normalizar({ ...filtrarCampos(existente), ...filtrarCampos(entrada) });
  validar(dados);

  await repo.atualizar(existente.id, { ...dados, atualizado_por: adminId ?? null });
  return buscarPorId(existente.id);
}

async function definirAtiva(valor, entrada = {}, adminId) {
  const existente = await garantirAcao(valor);

  const ativa = paraBooleano(entrada.ativa);
  if (ativa === undefined) throw new AppError('Informe "ativa" como true ou false.', 400);

  await repo.definirAtiva(existente.id, ativa, adminId ?? null);
  return buscarPorId(existente.id);
}

async function remover(valor) {
  const existente = await garantirAcao(valor);
  await repo.remover(existente.id);
}

module.exports = {
  listarPublicas,
  listarAdmin,
  buscarPorId,
  criar,
  atualizar,
  definirAtiva,
  remover,
};