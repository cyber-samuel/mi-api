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

module.exports = { login, register, logout, recuperarContrasena, cambiarContrasena,
  getPerfil, editarPerfil, desactivarCuenta };
