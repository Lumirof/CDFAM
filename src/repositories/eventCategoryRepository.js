const pool = require('../config/database');

async function listar({ busca } = {}) {
    const params = [];
    let where = '';

    if (busca) {
        where = 'WHERE c.nome LIKE ?';
        params.push(`%${busca}%`);
    }

    const [linhas] = await pool.query(
        `SELECT c.id, c.nome, c.cor,
                (SELECT COUNT(*)
                 FROM evento e
                 WHERE e.categoria_id = c.id) AS total_eventos
         FROM categoria_evento c
         ${where}
         ORDER BY c.nome ASC, c.id ASC`,
        params
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT c.id, c.nome, c.cor,
                (SELECT COUNT(*)
                 FROM evento e
                 WHERE e.categoria_id = c.id) AS total_eventos
         FROM categoria_evento c
         WHERE c.id = ?`,
        [id]
    );
    return linhas[0] || null;
}

async function buscarPorNome(nome, ignorarId) {
    const [linhas] = await pool.query(
        `SELECT id
         FROM categoria_evento
         WHERE nome = ? AND id <> ?
         LIMIT 1`,
        [nome, ignorarId ?? 0]
    );
    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO categoria_evento (nome, cor)
         VALUES (?, ?)`,
        [dados.nome, dados.cor]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE categoria_evento
         SET nome = ?, cor = ?
         WHERE id = ?`,
        [dados.nome, dados.cor, id]
    );
}

async function remover(id) {
    await pool.query(
        `DELETE FROM categoria_evento
         WHERE id = ?`,
        [id]
    );
}

module.exports = {
    listar,
    buscarPorId,
    buscarPorNome,
    criar,
    atualizar,
    remover
};