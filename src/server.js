
const express = require('express');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API CDFAM funcionando! Iasmin'
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor CDFAM rodando em http://localhost:${PORT}`);
});