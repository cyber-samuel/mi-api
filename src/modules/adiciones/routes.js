const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/',             verifyToken, checkPermiso('adiciones.listar'),   controller.listar);
router.post('/',            verifyToken, checkPermiso('adiciones.crear'),    controller.crear);
router.get('/:id',          verifyToken, checkPermiso('adiciones.ver'),      controller.obtener);
router.put('/:id',          verifyToken, checkPermiso('adiciones.editar'),   controller.actualizar);
router.delete('/:id',       verifyToken, checkPermiso('adiciones.eliminar'), controller.eliminar);
router.patch('/:id/estado', verifyToken, checkPermiso('adiciones.estado'),   controller.cambiarEstado);

module.exports = router;
