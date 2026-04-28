const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas antes de /:id
router.get('/filtrar',         verifyToken, checkPermiso('confirmar_domicilios'),        controller.filtrar);
router.get('/mis-pedidos',     verifyToken, checkPermiso('ver_pedidos_domiciliario'),    controller.misPedidos);
router.get('/',                verifyToken, checkPermiso('confirmar_domicilios'),        controller.listar);
router.post('/asignar',        verifyToken, checkPermiso('confirmar_domicilios'),        controller.asignar);
router.get('/:id',             verifyToken, checkPermiso('confirmar_domicilios'),        controller.obtener);
router.patch('/:id/coger',     verifyToken, checkPermiso('ver_pedidos_domiciliario'),    controller.coger);
router.patch('/:id/despachar', verifyToken, checkPermiso('facturar_pedido'),             controller.despachar);
router.patch('/:id/entregar',  verifyToken, checkPermiso('facturar_pedido'),             controller.entregar);
router.patch('/:id/estado',    verifyToken, checkPermiso('confirmar_domicilios'),        controller.cambiarEstado);

module.exports = router;
