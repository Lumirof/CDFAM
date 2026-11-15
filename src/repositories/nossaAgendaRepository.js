const pool = require('../config/database');

async function listarAdmin() {
    const [linhas] = await pool.query(
        `SELECT id, titulo, url, periodo, vigente, criado_em, atualizado_por
         FROM nossa_agenda
         ORDER BY vigente DESC, criado_em DESC, id DESC`
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT id, titulo, url, periodo, vigente, criado_em, atualizado_por
         FROM nossa_agenda
         WHERE id = ?
         LIMIT 1`,
        [id]
    );
    return linhas[0] || null;
}

async function buscarVigente() {
    const [linhas] = await pool.query(
        `SELECT id, titulo, url, periodo
         FROM nossa_agenda
         WHERE vigente = 1
         LIMIT 1`
    );
    return linhas[0] || null;
}

async function criar(dados) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        if (dados.vigente) {
            await conexao.query(
                `UPDATE nossa_agenda SET vigente = 0 WHERE vigente = 1`
            );
        }

        const [resultado] = await conexao.query(
            `INSERT INTO nossa_agenda (
                titulo,
                url,
                periodo,
                vigente,
                atualizado_por
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                dados.titulo,
                dados.url,
                dados.periodo,
                dados.vigente ? 1 : 0,
                dados.atualizado_por ?? null
            ]
        );

        await conexao.commit();
        return resultado.insertId;
    } catch (err) {
        await conexao.rollback();
        throw err;
    } finally {
        conexao.release();
    }
}

async function atualizar(id, dados) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        if (dados.vigente) {
            await conexao.query(
                `UPDATE nossa_agenda SET vigente = 0 WHERE vigente = 1 AND id <> ?`,
                [id]
            );
        }

        await conexao.query(
            `UPDATE nossa_agenda
             SET titulo = ?,
                 url = ?,
                 periodo = ?,
                 vigente = ?,
                 atualizado_por = ?
             WHERE id = ?`,
            [
                dados.titulo,
                dados.url,
                dados.periodo,
                dados.vigente ? 1 : 0,
                dados.atualizado_por ?? null,
                id
            ]
        );

        await conexao.commit();
    } catch (err) {
        await conexao.rollback();
        throw err;
    } finally {
        conexao.release();
    }
}

async function excluir(id) {
    const [resultado] = await pool.query(
        `DELETE FROM nossa_agenda
         WHERE id = ?`,
        [id]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    listarAdmin,
    buscarPorId,
    buscarVigente,
    criar,
    atualizar,
    excluir
};