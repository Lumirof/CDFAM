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

async function desativarSeNaoForUltimo(id) {
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();

        const [administradoresAtivos] = await conexao.query(
            `SELECT id
             FROM administrador
             WHERE ativo = TRUE
             FOR UPDATE`
        );

        if (administradoresAtivos.length <= 1) {
            await conexao.rollback();
            return false;
        }

        const [resultado] = await conexao.query(
            `UPDATE administrador
             SET ativo = FALSE
             WHERE id = ? AND ativo = TRUE`,
            [id]
        );

        await conexao.commit();
        return resultado.affectedRows > 0;

    } catch (err) {
        await conexao.rollback();
        throw err;

    } finally {
        conexao.release();
    }
}

async function reativar(id) {
    const [resultado] = await pool.query(
        `UPDATE administrador
         SET ativo = TRUE
         WHERE id = ?`,
        [id]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    buscarPorEmail,
    listar,
    buscarPorId,
    criar,
    atualizar,
    desativarSeNaoForUltimo,
    reativar
};