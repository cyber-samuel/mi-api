const authService = require('./service');
const { loginSchema, registerSchema, recuperarSchema, cambiarContrasenaSchema, editarPerfilSchema } = require('./schema');
const { success } = require('../../utils/response');

const login = async (req, res, next) => {
  try {
    const datos = loginSchema.parse(req.body);
    success(res, await authService.login(datos), 'Login exitoso');
  } catch (err) { next(err); }
};

const register = async (req, res, next) => {
  try {
    const datos = registerSchema.parse(req.body);
    success(res, await authService.register(datos), 'Usuario registrado', 201);
  } catch (err) { next(err); }
};

const logout = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    success(res, authService.logout(token), 'Sesión cerrada');
  } catch (err) { next(err); }
};

const recuperarContrasena = async (req, res, next) => {
  try {
    const { email } = recuperarSchema.parse(req.body);
    success(res, await authService.recuperarContrasena({ email }), 'Token de recuperación generado');
  } catch (err) { next(err); }
};

const cambiarContrasena = async (req, res, next) => {
  try {
    const datos = cambiarContrasenaSchema.parse(req.body);
    success(res, await authService.cambiarContrasena(datos), 'Contraseña actualizada');
  } catch (err) { next(err); }
};

const getPerfil = async (req, res, next) => {
  try {
    success(res, await authService.getPerfil(req.user.id_usuario));
  } catch (err) { next(err); }
};

const editarPerfil = async (req, res, next) => {
  try {
    const datos = editarPerfilSchema.parse(req.body);
    success(res, await authService.editarPerfil(req.user.id_usuario, datos), 'Perfil actualizado');
  } catch (err) { next(err); }
};

const desactivarCuenta = async (req, res, next) => {
  try {
    success(res, await authService.desactivarCuenta(req.user.id_usuario), 'Cuenta desactivada');
  } catch (err) { next(err); }
};

const misDirecciones = async (req, res, next) => {
  try {
    const prisma = require('../../config/prisma');
    const cliente = await prisma.cliente.findUnique({ where: { id_usuario: req.user.id_usuario } });
    if (!cliente) { success(res, []); return; }
    const dirs = await prisma.direccion.findMany({ where: { id_cliente: cliente.id_cliente, estado: 1 } });
    success(res, dirs);
  } catch (err) { next(err); }
};

const crearMiDireccion = async (req, res, next) => {
  try {
    const prisma = require('../../config/prisma');
    const cliente = await prisma.cliente.findUnique({ where: { id_usuario: req.user.id_usuario } });
    if (!cliente) throw { status: 404, message: 'Perfil de cliente no encontrado' };
    const { direccion_linea, barrio, ciudad, referencia } = req.body;
    const dir = await prisma.direccion.create({
      data: { id_cliente: cliente.id_cliente, direccion_linea, barrio, ciudad, referencia },
    });
    success(res, dir, 'Dirección creada', 201);
  } catch (err) { next(err); }
};

const cambiarContrasenaAuth = async (req, res, next) => {
  try {
    const bcrypt = require('bcryptjs');
    const prisma = require('../../config/prisma');
    const { contrasena_actual, nueva_contrasena } = req.body;
    if (!contrasena_actual || !nueva_contrasena) throw { status: 400, message: 'Faltan campos requeridos' };
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: req.user.id_usuario } });
    const valida = await bcrypt.compare(contrasena_actual, usuario.contrasena);
    if (!valida) throw { status: 401, message: 'Contraseña actual incorrecta' };
    const hash = await bcrypt.hash(nueva_contrasena, 10);
    await prisma.usuario.update({ where: { id_usuario: req.user.id_usuario }, data: { contrasena: hash } });
    success(res, null, 'Contraseña actualizada');
  } catch (err) { next(err); }
};

module.exports = { login, register, logout, recuperarContrasena, cambiarContrasena,
  getPerfil, editarPerfil, desactivarCuenta, misDirecciones, crearMiDireccion, cambiarContrasenaAuth };
