const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas ANTES que /:id
router.get('/buscar',       verifyToken, checkPermiso('productos.listar'),   controller.buscar);
router.get('/filtrar',      verifyToken, checkPermiso('productos.listar'),   controller.filtrar);
router.get('/',             verifyToken, checkPermiso('productos.listar'),   controller.listar);
router.post('/',            verifyToken, checkPermiso('productos.crear'),    controller.crear);
router.get('/:id',          verifyToken, checkPermiso('productos.ver'),      controller.obtener);
router.put('/:id',          verifyToken, checkPermiso('productos.editar'),   controller.actualizar);
router.delete('/:id',       verifyToken, checkPermiso('productos.eliminar'), controller.eliminar);
router.patch('/:id/estado', verifyToken, checkPermiso('productos.estado'),   controller.cambiarEstado);

module.exports = router;
