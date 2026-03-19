const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

// Estáticas antes de /:id
router.get('/buscar',               verifyToken, checkPermiso('usuarios.listar'),          controller.buscar);
router.get('/',                     verifyToken, checkPermiso('usuarios.listar'),           controller.listar);
router.post('/',                    verifyToken, checkPermiso('usuarios.crear'),            controller.crear);
router.get('/:id',                  verifyToken, checkPermiso('usuarios.ver'),              controller.obtener);
router.put('/:id',                  verifyToken, checkPermiso('usuarios.editar'),           controller.actualizar);
router.delete('/:id',               verifyToken, checkPermiso('usuarios.eliminar'),         controller.eliminar);
router.patch('/:id/activar-desactivar', verifyToken, checkPermiso('usuarios.activar-desactivar'), controller.activarDesactivar);
router.patch('/:id/rol',            verifyToken, checkPermiso('usuarios.asignar-rol'),      controller.asignarRol);

module.exports = router;
