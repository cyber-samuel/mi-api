const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const ver      = checkPermiso('ver_empleados');
const gestionar = checkPermiso('gestionar_empleados');

router.get('/buscar',        verifyToken, ver,       controller.buscar);
router.get('/',              verifyToken, ver,       controller.listar);
router.post('/',             verifyToken, gestionar, controller.crear);
router.get('/:id',           verifyToken, ver,       controller.obtener);
router.put('/:id',           verifyToken, gestionar, controller.actualizar);
router.delete('/:id',        verifyToken, gestionar, controller.eliminar);
router.patch('/:id/estado',  verifyToken, gestionar, controller.cambiarEstado);

module.exports = router;
