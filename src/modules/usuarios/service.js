const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');

const select = {
  id_usuario: true, id_rol: true, nombre: true,
  email: true, estado: true, fecha_registro: true, rol: true,
};

const listar = () => prisma.usuario.findMany({ select });

const buscar = (q) => prisma.usuario.findMany({
  where: { OR: [{ nombre: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
  select,
});

const obtener = async (id) => {
  const u = await prisma.usuario.findUnique({ where: { id_usuario: id }, select });
  if (!u) throw { status: 404, message: 'Usuario no encontrado' };
  return u;
};

const crear = async (datos) => {
  const existe = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (existe) throw { status: 409, message: 'El email ya está registrado' };
  const hash = await bcrypt.hash(datos.contrasena, 10);
  return prisma.usuario.create({ data: { ...datos, contrasena: hash }, select });
};

const actualizar = async (id, datos) => {
  await obtener(id);
  if (datos.contrasena) datos.contrasena = await bcrypt.hash(datos.contrasena, 10);
  return prisma.usuario.update({ where: { id_usuario: id }, data: datos, select });
};

const eliminar = async (id) => {
  await obtener(id);
  return prisma.usuario.delete({ where: { id_usuario: id } });
};

const activarDesactivar = async (id) => {
  const u = await obtener(id);
  return prisma.usuario.update({ where: { id_usuario: id }, data: { estado: u.estado ? 0 : 1 }, select });
};

const asignarRol = async (id, id_rol) => {
  await obtener(id);
  const rol = await prisma.rol.findUnique({ where: { id_rol } });
  if (!rol) throw { status: 404, message: 'Rol no encontrado' };
  return prisma.usuario.update({ where: { id_usuario: id }, data: { id_rol }, select });
};

module.exports = { listar, buscar, obtener, crear, actualizar, eliminar, activarDesactivar, asignarRol };
