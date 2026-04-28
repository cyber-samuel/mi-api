const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');
const { checkPermisoAny } = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas antes de /:id  (rutas de cliente — sin checkPermiso)
router.get('/mis-pedidos',     verifyToken,                                                             controller.misVentas);
router.post('/mi-pedido',      verifyToken,                                                             controller.crearMiPedido);
router.get('/filtrar',         verifyToken, checkPermiso('ver_ventas'),                                 controller.filtrar);
router.get('/',                verifyToken, checkPermiso('ver_ventas'),                                 controller.listar);
router.post('/',               verifyToken, checkPermiso('gestionar_ventas'),                           controller.crear);
router.get('/:id',             verifyToken, checkPermiso('ver_ventas'),                                 controller.obtener);
router.get('/:id/total',       verifyToken, checkPermiso('ver_ventas'),                                 controller.totalVenta);
router.get('/:id/comprobante', verifyToken, checkPermiso('ver_ventas'),                                 controller.comprobante);
router.post('/:id/whatsapp',   verifyToken, checkPermiso('ver_ventas'),                                 controller.whatsapp);
// cambiar_estado_venta (confirmador/admin) O facturar_pedido (domiciliario al marcar entregado)
router.patch('/:id/estado',    verifyToken, checkPermisoAny('cambiar_estado_venta','facturar_pedido'),  controller.cambiarEstado);
router.patch('/:id/anular',    verifyToken, checkPermiso('anular_venta'),                               controller.anular);

module.exports = router;
