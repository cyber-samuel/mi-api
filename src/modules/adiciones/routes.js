const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const ga = checkPermiso('gestionar_adiciones');

router.get('/',             verifyToken, ga, controller.listar);
router.post('/',            verifyToken, ga, controller.crear);
router.get('/:id',          verifyToken, ga, controller.obtener);
router.put('/:id',          verifyToken, ga, controller.actualizar);
router.delete('/:id',       verifyToken, ga, controller.eliminar);
router.patch('/:id/estado', verifyToken, ga, controller.cambiarEstado);

module.exports = router;
