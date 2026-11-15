const pool = require('../config/database');

const CONDICAO_PUBLICA = `
    e.status = 'publicada'
    AND e.publicada_em <= CURDATE()
    AND (e.publicada_ate IS NULL OR e.publicada_ate >= CURDATE())
`;

const SELECT = `
    SELECT e.id, e.categoria_id, c.nome AS categoria_nome, c.cor AS categoria_cor,
           e.titulo, e.descricao,
           DATE_FORMAT(e.data_inicio, '%Y-%m-%dT%H:%i:%s') AS data_inicio,
           DATE_FORMAT(e.data_fim, '%Y-%m-%dT%H:%i:%s') AS data_fim,
           e.dia_inteiro, e.local, e.publico_alvo, e.noticia_id,
           e.status, e.destaque,
           DATE_FORMAT(e.publicada_em, '%Y-%m-%d') AS publicada_em,
           DATE_FORMAT(e.publicada_ate, '%Y-%m-%d') AS publicada_ate,
           e.atualizado_em, e.atualizado_por
    FROM evento e
    JOIN categoria_evento c ON c.id = e.categoria_id
`;

function mapear(linha) {
    return linha
        ? {
            ...linha,
            dia_inteiro: Boolean(linha.dia_inteiro),
            destaque: Boolean(linha.destaque)
        }
        : null;
}

function montarFiltros({ somentePublicos, status, categoriaId, destaque, busca, de, ate }) {
    const where = [];
    const params = [];
    if (somentePublicos) {
        where.push(CONDICAO_PUBLICA);
    }
    if (status) {
        where.push('e.status = ?');
        params.push(status);
    }
    if (categoriaId) {
        where.push('e.categoria_id = ?');
        params.push(categoriaId);
    }
    if (destaque !== undefined) {
        where.push('e.destaque = ?');
        params.push(destaque);
    }
    if (busca) {
        where.push('(e.titulo LIKE ? OR e.descricao LIKE ? OR e.local LIKE ?)');
        params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }
    if (de) {
        where.push('COALESCE(e.data_fim, e.data_inicio) >= ?');
        params.push(de);
    }
    if (ate) {
        where.push('e.data_inicio <= ?');
        params.push(ate);
    }
    return {
        clausula: where.length ? `WHERE ${where.join(' AND ')}` : '',
        params
    };
}

async function listar(filtros, { limite, deslocamento }) {
    const { clausula, params } = montarFiltros(filtros);

    const [linhas] = await pool.query(
        `${SELECT}
         ${clausula}
         ORDER BY e.data_inicio ASC, e.id ASC
         LIMIT ? OFFSET ?`,
        [...params, limite, deslocamento]
    );

    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM evento e
         ${clausula}`,
        params
    );
    return {
        itens: linhas.map(mapear),
        total
    };
}

async function buscarPorId(id) {
    const [linhas] = await pool.query(
        `${SELECT}
         WHERE e.id = ?`,
        [id]
    );
    return mapear(linhas[0]);
}

async function buscarPublicoPorId(id) {
    const [linhas] = await pool.query(
        `${SELECT}
         WHERE e.id = ?
         AND ${CONDICAO_PUBLICA}`,
        [id]
    );
    return mapear(linhas[0]);
}

async function listarCategorias() {
    const [linhas] = await pool.query(
        `SELECT id, nome, cor
         FROM categoria_evento
         ORDER BY nome`
    );
    return linhas;
}

async function criar(dados) {
    const [resultado] = await pool.query(
        `INSERT INTO evento
            (categoria_id, titulo, descricao, data_inicio, data_fim, dia_inteiro,
             \`local\`, publico_alvo, noticia_id, status, destaque,
             publicada_em, publicada_ate, atualizado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURDATE()), ?, ?)`,
        [
            dados.categoria_id,
            dados.titulo,
            dados.descricao,
            dados.data_inicio,
            dados.data_fim,
            dados.dia_inteiro,
            dados.local,
            dados.publico_alvo,
            dados.noticia_id,
            dados.status,
            dados.destaque,
            dados.publicada_em,
            dados.publicada_ate,
            dados.atualizado_por
        ]
    );
    return resultado.insertId;
}

async function atualizar(id, dados) {
    await pool.query(
        `UPDATE evento
         SET categoria_id = ?, titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?,
             dia_inteiro = ?, \`local\` = ?, publico_alvo = ?, noticia_id = ?,
             status = ?, destaque = ?, publicada_em = COALESCE(?, publicada_em),
             publicada_ate = ?, atualizado_por = ?
         WHERE id = ?`,
        [
            dados.categoria_id,
            dados.titulo,
            dados.descricao,
            dados.data_inicio,
            dados.data_fim,
            dados.dia_inteiro,
            dados.local,
            dados.publico_alvo,
            dados.noticia_id,
            dados.status,
            dados.destaque,
            dados.publicada_em,
            dados.publicada_ate,
            dados.atualizado_por,
            id
        ]
    );
}

async function remover(id) {
    await pool.query(
        `DELETE FROM evento
         WHERE id = ?`,
        [id]
    );
}

module.exports = {
    listar,
    buscarPorId,
    buscarPublicoPorId,
    listarCategorias,
    criar,
    atualizar,
    remover
};