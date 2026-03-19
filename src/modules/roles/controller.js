const service = require('./service');
const { crearRolSchema, asignarPermisosSchema } = require('./schema');
const { success } = require('../../utils/response');

const listar = async (req, res, next) => {
  try { success(res, await service.listar()); } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const datos = crearRolSchema.parse(req.body);
    success(res, await service.crear(datos), 'Rol creado', 201);
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const datos = crearRolSchema.partial().parse(req.body);
    success(res, await service.actualizar(Number(req.params.id), datos), 'Rol actualizado');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    await service.eliminar(Number(req.params.id));
    success(res, null, 'Rol eliminado');
  } catch (err) { next(err); }
};

const asignarPermisos = async (req, res, next) => {
  try {
    const { permisos } = asignarPermisosSchema.parse(req.body);
    success(res, await service.asignarPermisos(Number(req.params.id), permisos), 'Permisos asignados');
  } catch (err) { next(err); }
};

const listarPermisos = async (req, res, next) => {
  try { success(res, await service.listarPermisos()); } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar, asignarPermisos, listarPermisos };
