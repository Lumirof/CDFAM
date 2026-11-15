const pool = require('../config/database');

async function listarPublicos(modalidade) {
    const parametros = [];
    let filtro = '';

    if (modalidade) {
        filtro = 'AND modalidade = ?';
        parametros.push(modalidade);
    }

    const [linhas] = await pool.query(
        `SELECT *
         FROM atividade_estagio
         WHERE ativa = TRUE
         ${filtro}
         ORDER BY modalidade ASC, ordem ASC, curso ASC`,
        parametros
    );
    return linhas;
}

async function listarAdmin(modalidade) {
    const parametros = [];
    let filtro = '';

    if (modalidade) {
        filtro = 'WHERE modalidade = ?';
        parametros.push(modalidade);
    }

    const [linhas] = await pool.query(
        `SELECT *
         FROM atividade_estagio
         ${filtro}
         ORDER BY modalidade ASC, ordem ASC, curso ASC`,
        parametros
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT *
         FROM atividade_estagio
         WHERE id = ?
         LIMIT 1`,
        [id]
    );
    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO atividade_estagio (
            modalidade,
            curso,
            descricao,
            ordem,
            atualizado_por
        ) VALUES (?, ?, ?, ?, ?)`,
        [
            dados.modalidade,
            dados.curso,
            dados.descricao,
            dados.ordem,
            dados.atualizado_por
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE atividade_estagio
         SET modalidade = ?,
             curso = ?,
             descricao = ?,
             ordem = ?,
             atualizado_por = ?
         WHERE id = ?`,
        [
            dados.modalidade,
            dados.curso,
            dados.descricao,
            dados.ordem,
            dados.atualizado_por,
            id
        ]
    );
}

async function desativar(id) {
    const [resultado] = await pool.query(
        `UPDATE atividade_estagio
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