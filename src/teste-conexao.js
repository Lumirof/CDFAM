const db = require('./config/database');

async function testarConexao() {
    try {
        const conexao = await db.getConnection();

        console.log('Conexão com MySQL estabelecida!');
        console.log('Banco conectado: CDFAM');

        conexao.release();

    } catch (error) {
        console.error('Erro ao conectar ao MySQL:', error.message);

    } finally {
        await db.end();
    }
}

testarConexao();