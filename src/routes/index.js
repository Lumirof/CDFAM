const { Router } = require('express');

const noticiaRoutes = require('./noticeRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const categoryNoticeRoutes = require('./categoryNoticeRoutes');

const auth = require('../middlewares/auth');

const router = Router();

router.use('/noticias', noticiaRoutes.publicas);
router.use('/categorias', categoryNoticeRoutes.publicas);
router.use('/auth', authRoutes);
router.use('/admin/noticias', auth, noticiaRoutes.admin);
router.use('/admin/administradores', auth, adminRoutes);
router.use('/admin/categorias', auth, categoryNoticeRoutes.admin);

module.exports = router;