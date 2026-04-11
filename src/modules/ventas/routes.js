const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas antes de /:id
router.get('/mis-pedidos',    verifyToken,                                      controller.misVentas);
router.post('/mi-pedido',     verifyToken,                                      controller.crearMiPedido);
router.get('/filtrar',        verifyToken,                                    controller.filtrar);
router.get('/',               verifyToken,                                    controller.listar);
router.post('/',              verifyToken, checkPermiso('ventas.crear'),      controller.crear);
router.get('/:id',            verifyToken,                                    controller.obtener);
router.get('/:id/total',      verifyToken,                                    controller.totalVenta);
router.get('/:id/comprobante',verifyToken,                                    controller.comprobante);
router.post('/:id/whatsapp',  verifyToken,                                    controller.whatsapp);
router.patch('/:id/estado',   verifyToken,                                    controller.cambiarEstado);
router.patch('/:id/anular',   verifyToken, checkPermiso('ventas.anular'),     controller.anular);

module.exports = router;
