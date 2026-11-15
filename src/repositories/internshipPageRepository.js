const pool = require('../config/database');


async function buscar() {
    const [linhas] = await pool.query(
        `SELECT id, texto_introducao, atualizado_em
         FROM pagina_estagio
         WHERE id = 1
         LIMIT 1`
    );
    return linhas[0] || null;
}

async function salvar(dados) {
    await pool.query(
        `INSERT INTO pagina_estagio (id, texto_introducao, atualizado_por)
         VALUES (1, ?, ?)
         ON DUPLICATE KEY UPDATE
            texto_introducao = VALUES(texto_introducao),
            atualizado_por = VALUES(atualizado_por)`,
        [dados.texto_introducao, dados.atualizado_por]
    );
}

module.exports = { buscar, salvar };