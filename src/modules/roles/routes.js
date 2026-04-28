const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const ver      = checkPermiso('ver_roles');
const gestionar = checkPermiso('gestionar_roles');

router.get('/permisos',                 verifyToken, gestionar, controller.listarPermisos);
router.get('/',                         verifyToken, ver,       controller.listar);
router.post('/',                        verifyToken, gestionar, controller.crear);
router.get('/:id',                      verifyToken, ver,       controller.obtener);
router.put('/:id',                      verifyToken, gestionar, controller.actualizar);
router.delete('/:id',                   verifyToken, gestionar, controller.eliminar);
router.patch('/:id/permisos',           verifyToken, gestionar, controller.asignarPermisos);
router.patch('/:id/activar-desactivar', verifyToken, gestionar, controller.activarDesactivar);

module.exports = router;
