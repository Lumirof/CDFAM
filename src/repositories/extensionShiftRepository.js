const pool = require('../config/database');

const ORDEM = "ORDER BY dia_semana ASC, FIELD(turno, 'manha', 'tarde') ASC";

async function listarDasAcoes(acaoIds) {
  if (!acaoIds.length) return [];
  const [linhas] = await pool.query(
    `SELECT id, acao_id, dia_semana, turno, observacao
     FROM acao_extensao_turno
     WHERE acao_id IN (?) ${ORDEM}`,
    [acaoIds]
  );
  return linhas;
}

async function listarPorAcao(acaoId) {
  return listarDasAcoes([acaoId]);
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT id, acao_id, dia_semana, turno, observacao
     FROM acao_extensao_turno WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function criar(acaoId, d) {
  const [resultado] = await pool.query(
    `INSERT INTO acao_extensao_turno (acao_id, dia_semana, turno, observacao)
     VALUES (?, ?, ?, ?)`,
    [acaoId, d.dia_semana, d.turno, d.observacao]
  );
  return resultado.insertId;
}

async function atualizar(id, d) {
  await pool.query(
    `UPDATE acao_extensao_turno
     SET dia_semana = ?, turno = ?, observacao = ?
     WHERE id = ?`,
    [d.dia_semana, d.turno, d.observacao, id]
  );
}

async function remover(id) {
  await pool.query('DELETE FROM acao_extensao_turno WHERE id = ?', [id]);
}

module.exports = {
  listarDasAcoes,
  listarPorAcao,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
