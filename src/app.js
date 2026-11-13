const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, naoEncontrado } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API CDFAM funcionando! Iasmin'
    });
});

app.use('/api', routes);

// Sempre por último
app.use(naoEncontrado);
app.use(errorHandler);

module.exports = app;