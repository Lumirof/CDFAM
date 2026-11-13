const pool = require('../config/database');

async function buscarPorEmail(email) {
    const [linhas] = await pool.query(
        `SELECT id, nome, email, senha_hash, ativo
         FROM administrador
         WHERE email = ?
         LIMIT 1`,
        [email]
    );

    return linhas[0] || null;
}

async function listar() {
    const [linhas] = await pool.query(
        `SELECT id, nome, email, ativo, criado_em, ultimo_login
         FROM administrador
         ORDER BY id DESC`
    );

    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT id, nome, email, ativo, criado_em, ultimo_login
         FROM administrador
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO administrador (nome, email, senha_hash)
         VALUES (?, ?, ?)`,
        [dados.nome, dados.email, dados.senha_hash]
    );

    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE administrador
         SET nome = ?,
             email = ?,
             senha_hash = COALESCE(?, senha_hash)
         WHERE id = ?`,
        [dados.nome, dados.email, dados.senha_hash || null, id]
    );
}

async function desativar(id) {
    await pool.query(
        `UPDATE administrador
         SET ativo = FALSE
         WHERE id = ?`,
        [id]
    );
}

module.exports = {
    buscarPorEmail,
    listar,
    buscarPorId,
    criar,
    atualizar,
    desativar
};