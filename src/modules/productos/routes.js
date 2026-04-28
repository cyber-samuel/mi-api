const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const gp = checkPermiso('gestionar_productos');

// Estáticas ANTES que /:id
router.get('/buscar',       verifyToken, gp, controller.buscar);
router.get('/filtrar',      verifyToken, gp, controller.filtrar);
router.get('/',             verifyToken, gp, controller.listar);
router.post('/',            verifyToken, gp, controller.crear);
router.get('/:id',          verifyToken, gp, controller.obtener);
router.put('/:id',          verifyToken, gp, controller.actualizar);
router.delete('/:id',       verifyToken, gp, controller.eliminar);
router.patch('/:id/estado', verifyToken, gp, controller.cambiarEstado);

module.exports = router;
