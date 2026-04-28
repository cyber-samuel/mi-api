const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const gt = checkPermiso('gestionar_toppings');

router.get('/',             verifyToken, gt, controller.listar);
router.post('/',            verifyToken, gt, controller.crear);
router.get('/:id',          verifyToken, gt, controller.obtener);
router.put('/:id',          verifyToken, gt, controller.actualizar);
router.delete('/:id',       verifyToken, gt, controller.eliminar);
router.patch('/:id/estado', verifyToken, gt, controller.cambiarEstado);

module.exports = router;
