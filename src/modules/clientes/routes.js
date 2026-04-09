const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/buscar',                  verifyToken, checkPermiso('clientes.listar'),    controller.buscar);
router.get('/',                        verifyToken, checkPermiso('clientes.listar'),    controller.listar);
router.post('/',                       verifyToken, checkPermiso('clientes.crear'),     controller.crear);
router.get('/:id',                     verifyToken, checkPermiso('clientes.ver'),       controller.obtener);
router.put('/:id',                     verifyToken, checkPermiso('clientes.editar'),    controller.actualizar);
router.delete('/:id',                  verifyToken, checkPermiso('clientes.eliminar'),  controller.eliminar);
router.patch('/:id/estado',            verifyToken, checkPermiso('clientes.estado'),    controller.cambiarEstado);
router.get('/:id/historial-pedidos',   verifyToken, checkPermiso('clientes.historial'), controller.historialPedidos);
router.get('/:id/toppings-favoritos',  verifyToken, checkPermiso('clientes.favoritos'), controller.toppingsFavoritos);
router.get('/:id/adiciones-favoritas', verifyToken, checkPermiso('clientes.favoritos'), controller.adicionesFavoritas);
router.get('/:id/perfil',              verifyToken, checkPermiso('clientes.perfil'),    controller.perfil);
router.get('/:id/direcciones',         verifyToken, checkPermiso('clientes.ver'),       controller.listarDirecciones);
router.post('/:id/direcciones',        verifyToken, checkPermiso('clientes.editar'),    controller.crearDireccion);

module.exports = router;
