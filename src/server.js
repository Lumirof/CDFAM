
require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        // Verifica a conexão com o MySQL
        const conexao = await db.getConnection();

        console.log('MySQL conectado com sucesso!');

        conexao.release();

        // Inicia o servidor
        app.listen(PORT, () => {
            console.log(
                `Servidor CDFAM rodando em http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error('Erro ao conectar ao MySQL:');
        console.error(error.message);

        process.exit(1);
    }
}

iniciarServidor();