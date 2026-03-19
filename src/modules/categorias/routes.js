const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas primero
router.get('/buscar',       verifyToken, checkPermiso('categorias.listar'), controller.buscar);
router.get('/',             verifyToken, checkPermiso('categorias.listar'), controller.listar);
router.post('/',            verifyToken, checkPermiso('categorias.crear'),  controller.crear);
router.get('/:id',          verifyToken, checkPermiso('categorias.listar'), controller.obtener);
router.put('/:id',          verifyToken, checkPermiso('categorias.editar'), controller.actualizar);
router.delete('/:id',       verifyToken, checkPermiso('categorias.eliminar'), controller.eliminar);
router.patch('/:id/estado', verifyToken, checkPermiso('categorias.estado'), controller.cambiarEstado);

module.exports = router;
