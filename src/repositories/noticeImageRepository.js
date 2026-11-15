const pool = require('../config/database');

const CONDICAO_PUBLICA = `
  n.status = 'publicada'
  AND n.publicada_em <= CURDATE()
  AND (n.publicada_ate IS NULL OR n.publicada_ate >= CURDATE())`;

const COLUNAS = `i.id, i.noticia_id, i.arquivo_url, i.texto_alt, i.legenda, i.ordem, i.atualizado_em`;

async function listar({ noticiaId, somentePublicas } = {}) {
    const where = [];
    const params = [];

    if (somentePublicas) where.push(CONDICAO_PUBLICA);
    if (noticiaId) { where.push('i.noticia_id = ?'); params.push(noticiaId); }

    const [linhas] = await pool.query(
        `SELECT ${COLUNAS}
         FROM noticia_imagem i
         JOIN noticia n ON n.id = i.noticia_id
         ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
         ORDER BY i.noticia_id ASC, i.ordem ASC, i.id ASC`,
        params
    );
    return linhas;
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `SELECT ${COLUNAS}
         FROM noticia_imagem i
         WHERE i.id = ?
         LIMIT 1`,
        [id]
    );
    return linhas[0] || null;
}

async function proximaOrdem(noticiaId) {
    const [[{ proxima }]] = await pool.query(
        `SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima
         FROM noticia_imagem
         WHERE noticia_id = ?`,
        [noticiaId]
    );
    return proxima;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO noticia_imagem
            (noticia_id, arquivo_url, texto_alt, legenda, ordem)
         VALUES (?, ?, ?, ?, ?)`,
        [
            dados.noticia_id,
            dados.arquivo_url,
            dados.texto_alt,
            dados.legenda || null,
            dados.ordem
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    const [resultado] = await pool.query(
        `UPDATE noticia_imagem
         SET arquivo_url = ?,
             texto_alt = ?,
             legenda = ?,
             ordem = ?
         WHERE id = ?`,
        [
            dados.arquivo_url,
            dados.texto_alt,
            dados.legenda || null,
            dados.ordem,
            id
        ]
    );
    return resultado.affectedRows > 0;
}

async function remover(id) {
    const [resultado] = await pool.query(
        'DELETE FROM noticia_imagem WHERE id = ?',
        [id]
    );
    return resultado.affectedRows > 0;
}

module.exports = {
    listar,
    buscarPorId,
    proximaOrdem,
    criar,
    atualizar,
    remover
};