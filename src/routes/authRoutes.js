const { Router } = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = Router();

router.post('/login', authController.login);
router.put('/alterar-senha', auth, authController.alterarSenha);
router.post('/logout', auth, authController.logout);

module.exports = router;