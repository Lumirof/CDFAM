const pool = require('../config/database');

async function listar() {
    const [linhas] = await pool.query(
        `SELECT id, nome, slug
         FROM categoria
         ORDER BY nome ASC`
    );

    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT id, nome, slug
         FROM categoria
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return linhas[0] || null;
}

async function buscarPorSlug(slug) {
    const [linhas] = await pool.query(
        `SELECT id, nome, slug
         FROM categoria
         WHERE slug = ?
         LIMIT 1`,
        [slug]
    );

    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO categoria (nome, slug)
         VALUES (?, ?)`,
        [dados.nome, dados.slug]
    );

    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE categoria
         SET nome = ?, slug = ?
         WHERE id = ?`,
        [dados.nome, dados.slug, id]
    );
}

async function remover(id) {
    await pool.query(
        `DELETE FROM categoria
         WHERE id = ?`,
        [id]
    );
}

module.exports = {
    listar,
    buscarPorId,
    buscarPorSlug,
    criar,
    atualizar,
    remover
};