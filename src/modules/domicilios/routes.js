const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/filtrar',      verifyToken, checkPermiso('domicilios.listar'),  controller.filtrar);
router.get('/',             verifyToken, checkPermiso('domicilios.listar'),  controller.listar);
router.post('/asignar',     verifyToken, checkPermiso('domicilios.asignar'), controller.asignar);
router.get('/:id',          verifyToken, checkPermiso('domicilios.ver'),     controller.obtener);
router.patch('/:id/estado', verifyToken, checkPermiso('domicilios.estado'),  controller.cambiarEstado);

module.exports = router;
