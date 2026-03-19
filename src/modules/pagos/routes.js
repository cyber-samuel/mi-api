const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Rutas estáticas ANTES que las dinámicas (:id)
router.get('/metodos-pago',   verifyToken, checkPermiso('metodos_pago.listar'),  controller.listarMetodos);
router.post('/metodos-pago',  verifyToken, checkPermiso('metodos_pago.crear'),   controller.crearMetodo);

router.post('/',   verifyToken, checkPermiso('pagos.crear'), controller.crear);
router.get('/:id', verifyToken, checkPermiso('pagos.ver'),   controller.obtener);

module.exports = router;
