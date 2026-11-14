const { Router } = require('express');

const noticiaRoutes = require('./noticeRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const categoryNoticeRoutes = require('./categoryNoticeRoutes');
const serviceRoutes = require('./serviceRoutes')
const serviceHorarioRoutes = require('./serviceHorarioRoutes');

const auth = require('../middlewares/auth');

const router = Router();

router.use('/noticias', noticiaRoutes.publicas);
router.use('/categorias', categoryNoticeRoutes.publicas);
router.use('/servicos', serviceRoutes.publicas)
router.use('/servico-horarios', serviceHorarioRoutes.publicas);
router.use('/auth', authRoutes);
router.use('/admin/noticias', auth, noticiaRoutes.admin);
router.use('/admin/administradores', auth, adminRoutes);
router.use('/admin/categorias', auth, categoryNoticeRoutes.admin);
router.use('/admin/servicos', serviceRoutes.admin)
router.use('/admin/servico-horarios', auth, serviceHorarioRoutes.admin);

module.exports = router;