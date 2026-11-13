const { Router } = require('express');

const noticiaRoutes = require('./noticeRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

const auth = require('../middlewares/auth');

const router = Router();

// Rotas públicas de notícias
router.use('/noticias', noticiaRoutes.publicas);

// Rotas de autenticação
router.use('/auth', authRoutes);

// CRUD de notícias protegido
router.use('/admin/noticias', auth, noticiaRoutes.admin);

// CRUD de administradores protegido
router.use('/admin/administradores', auth, adminRoutes);

module.exports = router;