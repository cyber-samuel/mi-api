const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const gc = checkPermiso('gestionar_categorias');

// Estáticas primero
router.get('/buscar',       verifyToken, gc, controller.buscar);
router.get('/',             verifyToken, gc, controller.listar);
router.post('/',            verifyToken, gc, controller.crear);
router.get('/:id',          verifyToken, gc, controller.obtener);
router.put('/:id',          verifyToken, gc, controller.actualizar);
router.delete('/:id',       verifyToken, gc, controller.eliminar);
router.patch('/:id/estado', verifyToken, gc, controller.cambiarEstado);

module.exports = router;
