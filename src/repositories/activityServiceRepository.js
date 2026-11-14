const pool = require('../config/database');

async function listarPublicos() {
    const [linhas] = await pool.query(
        `SELECT
            a.*,
            s.nome AS servico_nome
         FROM atividade_servico a
         INNER JOIN servico_atendimento s
            ON a.servico_id = s.id
         WHERE a.ativa = TRUE
         AND s.ativo = TRUE
         ORDER BY s.ordem ASC, a.nome ASC`
    );
    return linhas;
}

async function listarAdmin() {
    const [linhas] = await pool.query(
        `SELECT
            a.*,
            s.nome AS servico_nome
         FROM atividade_servico a
         INNER JOIN servico_atendimento s
            ON a.servico_id = s.id
         ORDER BY s.ordem ASC, a.nome ASC`
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT
            a.*,
            s.nome AS servico_nome
         FROM atividade_servico a
         INNER JOIN servico_atendimento s
            ON a.servico_id = s.id
         WHERE a.id = ?
         LIMIT 1`,
        [id]
    );
    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO atividade_servico (
            servico_id,
            nome
        ) VALUES (?, ?)`,
        [
            dados.servico_id,
            dados.nome
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE atividade_servico
         SET servico_id = ?,
             nome = ?
         WHERE id = ?`,
        [
            dados.servico_id,
            dados.nome,
            id
        ]
    );
}

async function desativar(id) {
    const [resultado] = await pool.query(
        `UPDATE atividade_servico
         SET ativa = FALSE
         WHERE id = ?`,
        [id]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    criar,
    atualizar,
    desativar
};