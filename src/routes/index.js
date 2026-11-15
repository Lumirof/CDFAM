const { Router } = require('express');

const noticiaRoutes = require('./noticeRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const categoryNoticeRoutes = require('./categoryNoticeRoutes');
const eventRoutes = require('./eventRoutes');
const serviceRoutes = require('./serviceRoutes')
const serviceHorarioRoutes = require('./serviceHorarioRoutes');
const activityServiceRoutes = require('./activityServiceRoutes');
const horarioFuncionamentoRoutes = require('./horarioFuncionamentoRoutes')
const eventCategoryRoutes = require('./eventCategoryRoutes');
const activityInternshipRoutes = require('./activityInternshipRoutes');
const internshipPageRoutes = require('./internshipPageRoutes');

const auth = require('../middlewares/auth');

const router = Router();

router.use('/noticias', noticiaRoutes.publicas);
router.use('/categorias', categoryNoticeRoutes.publicas);
router.use('/servicos', serviceRoutes.publicas)
router.use('/servico-horarios', serviceHorarioRoutes.publicas);
router.use('/evento', eventRoutes.publicas);
router.use('/atividades-servicos', activityServiceRoutes.publicas)
router.use('/horario-funcionamento', horarioFuncionamentoRoutes.publicas)
router.use('/evento-categoria', eventCategoryRoutes.publicas)
router.use('/atividades-estagio', activityInternshipRoutes.publicas)
router.use('/pagina-estagio', internshipPageRoutes.publicas)
router.use('/auth', authRoutes);
router.use('/admin/noticias', auth, noticiaRoutes.admin);
router.use('/admin/administradores', auth, adminRoutes);
router.use('/admin/categorias', auth, categoryNoticeRoutes.admin);
router.use('/admin/evento', auth, eventRoutes.admin);
router.use('/admin/servicos', auth, serviceRoutes.admin)
router.use('/admin/servico-horarios', auth, serviceHorarioRoutes.admin);
router.use('/admin/atividades-servicos', auth, activityServiceRoutes.admin)
router.use('/admin/horario-funcionamento', auth, horarioFuncionamentoRoutes.admin)
router.use('/admin/evento-categoria', auth, eventCategoryRoutes.admin)
router.use('/admin/atividades-estagio', auth, activityInternshipRoutes.admin)
router.use('/admin/pagina-estagio', auth, internshipPageRoutes.admin)



module.exports = router;