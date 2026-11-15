const pool = require('../config/database');

async function listarPublicos() {
    const [linhas] = await pool.query(
        `SELECT b.*, s.nome AS servico_nome
         FROM bloqueio_agenda b
         LEFT JOIN servico_atendimento s ON s.id = b.servico_id
         WHERE s.id IS NULL OR s.ativo = TRUE
         ORDER BY b.data_inicio ASC, b.hora_inicio ASC`
    );
    return linhas;
}

async function listarAdmin() {
    const [linhas] = await pool.query(
        `SELECT b.*, s.nome AS servico_nome
         FROM bloqueio_agenda b
         LEFT JOIN servico_atendimento s ON s.id = b.servico_id
         ORDER BY b.data_inicio ASC, b.hora_inicio ASC`
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT b.*, s.nome AS servico_nome
         FROM bloqueio_agenda b
         LEFT JOIN servico_atendimento s ON s.id = b.servico_id
         WHERE b.id = ?`,
        [id]
    );
    return linhas[0];
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO bloqueio_agenda
         (servico_id, tipo, data_inicio, data_fim,
          hora_inicio, hora_fim, motivo, atualizado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.servico_id || null,
            dados.tipo,
            dados.data_inicio,
            dados.data_fim || null,
            dados.hora_inicio || null,
            dados.hora_fim || null,
            dados.motivo || null,
            dados.atualizado_por || null
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    const [resultado] = await pool.query(
        `UPDATE bloqueio_agenda
         SET servico_id = ?,
             tipo = ?,
             data_inicio = ?,
             data_fim = ?,
             hora_inicio = ?,
             hora_fim = ?,
             motivo = ?,
             atualizado_por = ?
         WHERE id = ?`,
        [
            dados.servico_id || null,
            dados.tipo,
            dados.data_inicio,
            dados.data_fim || null,
            dados.hora_inicio || null,
            dados.hora_fim || null,
            dados.motivo || null,
            dados.atualizado_por || null,
            id
        ]
    );
    return resultado.affectedRows;
}

async function excluir(id) {
    const [resultado] = await pool.query(
        `DELETE FROM bloqueio_agenda
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
    excluir
};