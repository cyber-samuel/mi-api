const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/buscar',        verifyToken, checkPermiso('empleados.listar'),   controller.buscar);
router.get('/',              verifyToken, checkPermiso('empleados.listar'),   controller.listar);
router.post('/',             verifyToken, checkPermiso('empleados.crear'),    controller.crear);
router.get('/:id',           verifyToken, checkPermiso('empleados.ver'),      controller.obtener);
router.put('/:id',           verifyToken, checkPermiso('empleados.editar'),   controller.actualizar);
router.delete('/:id',        verifyToken, checkPermiso('empleados.eliminar'), controller.eliminar);
router.patch('/:id/estado',  verifyToken, checkPermiso('empleados.estado'),   controller.cambiarEstado);

module.exports = router;
