const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/',             verifyToken, checkPermiso('metodos_pago.listar'), controller.listar);
router.post('/',            verifyToken, checkPermiso('metodos_pago.crear'),  controller.crear);
router.put('/:id',          verifyToken, checkPermiso('metodos_pago.editar'), controller.actualizar);
router.patch('/:id/estado', verifyToken, checkPermiso('metodos_pago.estado'), controller.cambiarEstado);

module.exports = router;
