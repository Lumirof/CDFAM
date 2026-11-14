const pool = require('../config/database');

async function listarPublicos() {
    const [linhas] = await pool.query(
        `SELECT *
         FROM horario_funcionamento
         WHERE ativo = TRUE
         ORDER BY dia_semana ASC, hora_inicio ASC`
    );

    return linhas;
}

async function listarAdmin() {
    const [linhas] = await pool.query(
        `SELECT *
         FROM horario_funcionamento
         ORDER BY dia_semana ASC, hora_inicio ASC`
    );

    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT *
         FROM horario_funcionamento
         WHERE id = ?`,
        [id]
    );

    return linhas[0];
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO horario_funcionamento
         (dia_semana, hora_inicio, hora_fim, observacao, atualizado_por)
         VALUES (?, ?, ?, ?, ?)`,
        [
            dados.dia_semana,
            dados.hora_inicio,
            dados.hora_fim,
            dados.observacao || null,
            dados.atualizado_por || null
        ]
    );

    return resultado.insertId;
}

async function atualizar(id, dados) {
    const [resultado] = await pool.query(
        `UPDATE horario_funcionamento
         SET dia_semana = ?,
             hora_inicio = ?,
             hora_fim = ?,
             observacao = ?,
             atualizado_por = ?
         WHERE id = ?`,
        [
            dados.dia_semana,
            dados.hora_inicio,
            dados.hora_fim,
            dados.observacao || null,
            dados.atualizado_por || null,
            id
        ]
    );

    return resultado.affectedRows;
}

async function desativar(id) {
    const [resultado] = await pool.query(
        `UPDATE horario_funcionamento
         SET ativo = FALSE
         WHERE id = ?`,
        [id]
    );

    return resultado.affectedRows;
}

module.exports = {
    listarPublicos,
    listarAdmin,
    buscarPorId,
    criar,
    atualizar,
    desativar
};