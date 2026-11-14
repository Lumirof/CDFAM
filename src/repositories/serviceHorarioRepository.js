const pool = require('../config/database');

async function listarAdmin() {
    const [linhas] = await pool.query(
        `SELECT
            sh.*,
            s.nome AS servico_nome,
            a.nome AS atividade_nome
         FROM servico_horario sh
         INNER JOIN servico_atendimento s
            ON sh.servico_id = s.id
         LEFT JOIN atividade_servico a
            ON sh.atividade_id = a.id
            AND sh.servico_id = a.servico_id
         ORDER BY sh.dia_semana ASC, sh.hora_inicio ASC`
    );
    return linhas;
}

async function listarPublicos() {
    const [linhas] = await pool.query(
        `SELECT
            sh.*,
            s.nome AS servico_nome,
            a.nome AS atividade_nome
         FROM servico_horario sh
         INNER JOIN servico_atendimento s
            ON sh.servico_id = s.id
         LEFT JOIN atividade_servico a
            ON sh.atividade_id = a.id
            AND sh.servico_id = a.servico_id
         WHERE s.ativo = TRUE
         AND (sh.atividade_id IS NULL OR a.ativa = TRUE)
         ORDER BY sh.dia_semana ASC, sh.hora_inicio ASC`
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT
            sh.*,
            s.nome AS servico_nome,
            a.nome AS atividade_nome
         FROM servico_horario sh
         INNER JOIN servico_atendimento s
            ON sh.servico_id = s.id
         LEFT JOIN atividade_servico a
            ON sh.atividade_id = a.id
            AND sh.servico_id = a.servico_id
         WHERE sh.id = ?
         LIMIT 1`,
        [id]
    );
    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO servico_horario (
            servico_id,
            atividade_id,
            dia_semana,
            hora_inicio,
            hora_fim,
            observacao
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            dados.servico_id,
            dados.atividade_id || null,
            dados.dia_semana,
            dados.hora_inicio,
            dados.hora_fim || null,
            dados.observacao || null
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE servico_horario
         SET servico_id = ?,
             atividade_id = ?,
             dia_semana = ?,
             hora_inicio = ?,
             hora_fim = ?,
             observacao = ?
         WHERE id = ?`,
        [
            dados.servico_id,
            dados.atividade_id || null,
            dados.dia_semana,
            dados.hora_inicio,
            dados.hora_fim || null,
            dados.observacao || null,
            id
        ]
    );
}

async function excluir(id) {
    const [resultado] = await pool.query(
        `DELETE FROM servico_horario
         WHERE id = ?`,
        [id]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    listarAdmin,
    listarPublicos,
    buscarPorId,
    criar,
    atualizar,
    excluir
};