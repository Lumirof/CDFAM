const pool = require('../config/database');

async function listarPublicos() {
    const [linhas] = await pool.query(
        `SELECT *
         FROM servico_atendimento
         WHERE ativo = TRUE
         ORDER BY ordem ASC, nome ASC`
    );
    return linhas;
}

async function listarAdmin() {
    const [linhas] = await pool.query(
        `SELECT *
         FROM servico_atendimento
         ORDER BY ordem ASC, nome ASC`
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT *
         FROM servico_atendimento
         WHERE id = ?
         LIMIT 1`,
        [id]
    );
    return linhas[0] || null;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO servico_atendimento (
            nome,
            realizado_por,
            descricao,
            publico_alvo,
            local,
            como_ser_atendido,
            link_titulo,
            link_url,
            ordem,
            atualizado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.nome,
            dados.realizado_por,
            dados.descricao,
            dados.publico_alvo,
            dados.local,
            dados.como_ser_atendido,
            dados.link_titulo,
            dados.link_url,
            dados.ordem,
            dados.atualizado_por
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE servico_atendimento
         SET nome = ?,
             realizado_por = ?,
             descricao = ?,
             publico_alvo = ?,
             local = ?,
             como_ser_atendido = ?,
             link_titulo = ?,
             link_url = ?,
             ordem = ?,
             atualizado_por = ?
         WHERE id = ?`,
        [
            dados.nome,
            dados.realizado_por,
            dados.descricao,
            dados.publico_alvo,
            dados.local,
            dados.como_ser_atendido,
            dados.link_titulo,
            dados.link_url,
            dados.ordem,
            dados.atualizado_por,
            id
        ]
    );
}

async function desativar(id) {
    const [resultado] = await pool.query(
        `UPDATE servico_atendimento
         SET ativo = FALSE
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