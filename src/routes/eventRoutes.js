const { Router } = require('express');
const controller = require('../controllers/eventController');
// Ajuste para o middleware de autenticação que você já usa nas rotas de notícias.
const auth = require('../middlewares/auth');

const publicas = Router();
publicas.get('/categorias', controller.listarCategorias);
publicas.get('/', controller.listarPublicos);
publicas.get('/:id', controller.buscarPublicoPorId);

const admin = Router();
admin.use(auth);
admin.get('/', controller.listarAdmin);
admin.get('/:id', controller.buscarPorId);
admin.post('/', controller.criar);
admin.put('/:id', controller.atualizar);
admin.delete('/:id', controller.remover);

// Exemplo de uso no app:
//   app.use('/api/eventos', publicas);
//   app.use('/api/admin/eventos', admin);
module.exports = { publicas, admin };