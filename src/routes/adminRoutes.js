const { Router } = require('express');
const adminController = require('../controllers/adminController');

const router = Router();

router.get('/', adminController.listar);
router.get('/:id', adminController.buscarPorId);
router.post('/', adminController.criar);
router.put('/:id', adminController.atualizar);
router.delete('/:id', adminController.desativar);
router.patch('/:id/reativar', adminController.reativar);

module.exports = router;