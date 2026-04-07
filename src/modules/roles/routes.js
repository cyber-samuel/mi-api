const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

router.get('/permisos',          verifyToken, checkPermiso('permisos.listar'),        controller.listarPermisos);
router.get('/',                  verifyToken, checkPermiso('roles.listar'),            controller.listar);
router.post('/',                 verifyToken, checkPermiso('roles.crear'),             controller.crear);
router.put('/:id',               verifyToken, checkPermiso('roles.editar'),            controller.actualizar);
router.delete('/:id',            verifyToken, checkPermiso('roles.eliminar'),          controller.eliminar);
router.patch('/:id/permisos',    verifyToken, checkPermiso('roles.asignar-permisos'), controller.asignarPermisos);
router.patch('/:id/activar-desactivar', verifyToken, checkPermiso('roles.activar-desactivar'), controller.activarDesactivar);

module.exports = router;
