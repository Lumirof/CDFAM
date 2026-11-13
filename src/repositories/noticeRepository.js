const pool = require('../config/database');

const CONDICAO_PUBLICA = `
  n.status = 'publicada'
  AND n.publicada_em <= CURDATE()
  AND (n.publicada_ate IS NULL OR n.publicada_ate >= CURDATE())`;

function select(comConteudo) {
  return `
    SELECT n.id, n.categoria_id, c.nome AS categoria_nome, c.slug AS categoria_slug,
           n.titulo, n.slug, n.resumo, ${comConteudo ? 'n.conteudo,' : ''}
           n.status, n.destaque, n.publicada_em, n.publicada_ate, n.autor_id, n.atualizado_em
    FROM noticia n
    JOIN categoria c ON c.id = n.categoria_id`;
}

function mapear(linha) {
  return linha ? { ...linha, destaque: Boolean(linha.destaque) } : null;
}

function montarFiltros({ somentePublicas, status, categoriaId, destaque, busca }) {
  const where = [];
  const params = [];

  if (somentePublicas) where.push(CONDICAO_PUBLICA);
  if (status) { where.push('n.status = ?'); params.push(status); }
  if (categoriaId) { where.push('n.categoria_id = ?'); params.push(categoriaId); }
  if (destaque !== undefined) { where.push('n.destaque = ?'); params.push(destaque); }
  if (busca) {
    where.push('(n.titulo LIKE ? OR n.resumo LIKE ?)');
    params.push(`%${busca}%`, `%${busca}%`);
  }

  return { clausula: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

async function listar(filtros, { limite, deslocamento }) {
  const { clausula, params } = montarFiltros(filtros);

  const [linhas] = await pool.query(
    `${select(false)} ${clausula}
     ORDER BY n.destaque DESC, n.publicada_em DESC, n.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limite, deslocamento]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM noticia n ${clausula}`,
    params
  );

  return { itens: linhas.map(mapear), total };
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(`${select(true)} WHERE n.id = ?`, [id]);
  return mapear(linhas[0]);
}

async function buscarPublicaPorSlug(slug) {
  const [linhas] = await pool.query(
    `${select(true)} WHERE n.slug = ? AND ${CONDICAO_PUBLICA}`,
    [slug]
  );
  return mapear(linhas[0]);
}

async function listarImagens(noticiaId) {
  const [linhas] = await pool.query(
    `SELECT id, arquivo_url, texto_alt, legenda, ordem
     FROM noticia_imagem WHERE noticia_id = ? ORDER BY ordem`,
    [noticiaId]
  );
  return linhas;
}

async function criar(d) {
  const [resultado] = await pool.query(
    `INSERT INTO noticia
       (categoria_id, titulo, slug, resumo, conteudo, status, destaque,
        publicada_em, publicada_ate, autor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURDATE()), ?, ?)`,
    [d.categoria_id, d.titulo, d.slug, d.resumo, d.conteudo, d.status, d.destaque,
     d.publicada_em, d.publicada_ate, d.autor_id]
  );
  return resultado.insertId;
}

async function atualizar(id, d) {
  await pool.query(
    `UPDATE noticia
     SET categoria_id = ?, titulo = ?, slug = ?, resumo = ?, conteudo = ?,
         status = ?, destaque = ?, publicada_em = COALESCE(?, publicada_em), publicada_ate = ?
     WHERE id = ?`,
    [d.categoria_id, d.titulo, d.slug, d.resumo, d.conteudo, d.status, d.destaque,
     d.publicada_em, d.publicada_ate, id]
  );
}

async function remover(id) {
  await pool.query('DELETE FROM noticia WHERE id = ?', [id]);
}

module.exports = {
  listar,
  buscarPorId,
  buscarPublicaPorSlug,
  listarImagens,
  criar,
  atualizar,
  remover,
};