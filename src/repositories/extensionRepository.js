const pool = require('../config/database');

const SELECT = `
  SELECT a.id, a.sigla, a.nome, a.codigo_prex, a.ano_referencia,
         a.coordenador_nome, a.coordenador_lotacao, a.publico_alvo, a.atividades,
         a.como_buscar_atendimento, a.local_atendimento, a.instagram_url,
         a.ordem, a.ativa, a.atualizado_em, a.atualizado_por
  FROM acao_extensao a`;

const CONDICAO_PUBLICA = `
  a.ativa = TRUE
  AND EXISTS (SELECT 1 FROM acao_extensao_turno t WHERE t.acao_id = a.id)`;

function mapear(linha) {
  return linha ? { ...linha, ativa: Boolean(linha.ativa) } : null;
}

function montarFiltros({ somentePublicas, ativa, ano, busca }) {
  const where = [];
  const params = [];

  if (somentePublicas) where.push(CONDICAO_PUBLICA);
  if (ativa !== undefined) { where.push('a.ativa = ?'); params.push(ativa); }
  if (ano) { where.push('a.ano_referencia = ?'); params.push(ano); }
  if (busca) {
    where.push('(a.nome LIKE ? OR a.sigla LIKE ? OR a.coordenador_nome LIKE ? OR a.atividades LIKE ?)');
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  return { clausula: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function valoresAcao(d) {
  return [
    d.sigla, d.nome, d.codigo_prex, d.ano_referencia,
    d.coordenador_nome, d.coordenador_lotacao, d.publico_alvo, d.atividades,
    d.como_buscar_atendimento, d.local_atendimento, d.instagram_url,
    d.ordem, d.ativa,
  ];
}

/* ---------- Ações de extensão ---------- */

async function listar(filtros, { limite, deslocamento }) {
  const { clausula, params } = montarFiltros(filtros);

  const [linhas] = await pool.query(
    `${SELECT} ${clausula}
     ORDER BY a.ordem ASC, a.nome ASC, a.id ASC
     LIMIT ? OFFSET ?`,
    [...params, limite, deslocamento]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM acao_extensao a ${clausula}`,
    params
  );

  return { itens: linhas.map(mapear), total };
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(`${SELECT} WHERE a.id = ?`, [id]);
  return mapear(linhas[0]);
}

async function criar(d) {
  const [resultado] = await pool.query(
    `INSERT INTO acao_extensao
       (sigla, nome, codigo_prex, ano_referencia, coordenador_nome, coordenador_lotacao,
        publico_alvo, atividades, como_buscar_atendimento, local_atendimento,
        instagram_url, ordem, ativa, atualizado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...valoresAcao(d), d.atualizado_por]
  );
  return resultado.insertId;
}

async function atualizar(id, d) {
  await pool.query(
    `UPDATE acao_extensao
     SET sigla = ?, nome = ?, codigo_prex = ?, ano_referencia = ?,
         coordenador_nome = ?, coordenador_lotacao = ?, publico_alvo = ?, atividades = ?,
         como_buscar_atendimento = ?, local_atendimento = ?, instagram_url = ?,
         ordem = ?, ativa = ?, atualizado_por = ?
     WHERE id = ?`,
    [...valoresAcao(d), d.atualizado_por, id]
  );
}

async function definirAtiva(id, ativa, adminId) {
  await pool.query(
    'UPDATE acao_extensao SET ativa = ?, atualizado_por = ? WHERE id = ?',
    [ativa, adminId, id]
  );
}

async function remover(id) {
  // Os turnos saem em cascata (ON DELETE CASCADE).
  await pool.query('DELETE FROM acao_extensao WHERE id = ?', [id]);
}

/* ---------- Turnos ---------- */

const ORDEM_TURNOS = "ORDER BY dia_semana ASC, FIELD(turno, 'manha', 'tarde') ASC";

async function listarTurnosDasAcoes(acaoIds) {
  if (!acaoIds.length) return [];
  const [linhas] = await pool.query(
    `SELECT id, acao_id, dia_semana, turno, observacao
     FROM acao_extensao_turno
     WHERE acao_id IN (?) ${ORDEM_TURNOS}`,
    [acaoIds]
  );
  return linhas;
}

async function listarTurnos(acaoId) {
  return listarTurnosDasAcoes([acaoId]);
}

async function buscarTurnoPorId(id) {
  const [linhas] = await pool.query(
    `SELECT id, acao_id, dia_semana, turno, observacao
     FROM acao_extensao_turno WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function criarTurno(acaoId, d) {
  const [resultado] = await pool.query(
    `INSERT INTO acao_extensao_turno (acao_id, dia_semana, turno, observacao)
     VALUES (?, ?, ?, ?)`,
    [acaoId, d.dia_semana, d.turno, d.observacao]
  );
  return resultado.insertId;
}

async function atualizarTurno(id, d) {
  await pool.query(
    `UPDATE acao_extensao_turno
     SET dia_semana = ?, turno = ?, observacao = ?
     WHERE id = ?`,
    [d.dia_semana, d.turno, d.observacao, id]
  );
}

async function removerTurno(id) {
  await pool.query('DELETE FROM acao_extensao_turno WHERE id = ?', [id]);
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  definirAtiva,
  remover,
  listarTurnosDasAcoes,
  listarTurnos,
  buscarTurnoPorId,
  criarTurno,
  atualizarTurno,
  removerTurno,
};
