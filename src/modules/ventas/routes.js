const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas antes de /:id
router.get('/mis-pedidos',    verifyToken,                                      controller.misVentas);
router.post('/mi-pedido',     verifyToken,                                      controller.crearMiPedido);
router.get('/filtrar',        verifyToken, checkPermiso('ventas.listar'),      controller.filtrar);
router.get('/',               verifyToken, checkPermiso('ventas.listar'),      controller.listar);
router.post('/',              verifyToken, checkPermiso('ventas.crear'),        controller.crear);
router.get('/:id',            verifyToken, checkPermiso('ventas.ver'),          controller.obtener);
router.get('/:id/total',      verifyToken, checkPermiso('ventas.ver'),          controller.totalVenta);
router.get('/:id/comprobante',verifyToken, checkPermiso('ventas.comprobante'),  controller.comprobante);
router.post('/:id/whatsapp',  verifyToken, checkPermiso('ventas.comprobante'),  controller.whatsapp);
router.patch('/:id/estado',   verifyToken, checkPermiso('ventas.estado'),       controller.cambiarEstado);
router.patch('/:id/anular',   verifyToken, checkPermiso('ventas.anular'),       controller.anular);

module.exports = router;
