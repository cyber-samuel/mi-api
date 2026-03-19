const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/',             verifyToken, checkPermiso('toppings.listar'),   controller.listar);
router.post('/',            verifyToken, checkPermiso('toppings.crear'),    controller.crear);
router.get('/:id',          verifyToken, checkPermiso('toppings.ver'),      controller.obtener);
router.put('/:id',          verifyToken, checkPermiso('toppings.editar'),   controller.actualizar);
router.delete('/:id',       verifyToken, checkPermiso('toppings.eliminar'), controller.eliminar);
router.patch('/:id/estado', verifyToken, checkPermiso('toppings.estado'),   controller.cambiarEstado);

module.exports = router;
