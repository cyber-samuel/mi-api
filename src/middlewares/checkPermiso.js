const prisma = require('../config/prisma');

/**
 * Verifica si el rol del usuario tiene el permiso requerido.
 * Los permisos se leen dinámicamente desde la tabla rol_permisos.
 *
 * Uso: router.get('/', verifyToken, checkPermiso('usuarios.listar'), controller)
 */
const checkPermiso = (nombrePermiso) => {
  return async (req, res, next) => {
    try {
      const { id_rol } = req.user;

      const permiso = await prisma.rolPermiso.findFirst({
        where: {
          id_rol,
          permiso: { nombre: nombrePermiso },
        },
      });

      if (!permiso) {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'No tienes permiso para realizar esta acción',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkPermiso;
