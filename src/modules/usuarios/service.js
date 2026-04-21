const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');

const select = {
  id_usuario: true, id_rol: true, nombre: true,
  email: true, estado: true, fecha_registro: true, rol: true,
};

const listar = () => prisma.usuario.findMany({
  where: { estado: 1 },
  include: { rol: true, cliente: true, empleado: true },
  orderBy: { fecha_registro: 'desc' },
});

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
  // Verificar ventas via cliente
  const cliente = await prisma.cliente.findUnique({ where: { id_usuario: id } });
  if (cliente) {
    const ventasCount = await prisma.venta.count({ where: { id_cliente: cliente.id_cliente } });
    if (ventasCount > 0) throw { status: 409, message: `No se puede eliminar: el usuario tiene ${ventasCount} venta(s) registrada(s)` };
  }
  // Soft-delete en cascada: usuario + empleado vinculado + cliente vinculado
  return prisma.$transaction(async (tx) => {
    try { await tx.empleado.updateMany({ where: { id_usuario: id }, data: { estado: 0 } }); } catch (_) {}
    try { await tx.cliente.updateMany({ where: { id_usuario: id }, data: { estado: 0 } }); } catch (_) {}
    return tx.usuario.update({ where: { id_usuario: id }, data: { estado: 0 }, select });
  });
};

const activarDesactivar = async (id) => {
  const u     = await obtener(id);
  const nuevo = u.estado ? 0 : 1;
  return prisma.$transaction(async (tx) => {
    try { await tx.empleado.updateMany({ where: { id_usuario: id }, data: { estado: nuevo } }); } catch (_) {}
    try { await tx.cliente.updateMany({ where: { id_usuario: id }, data: { estado: nuevo } }); } catch (_) {}
    return tx.usuario.update({ where: { id_usuario: id }, data: { estado: nuevo }, select });
  });
};

const asignarRol = async (id, id_rol) => {
  await obtener(id);
  const rol = await prisma.rol.findUnique({ where: { id_rol } });
  if (!rol) throw { status: 404, message: 'Rol no encontrado' };
  return prisma.usuario.update({ where: { id_usuario: id }, data: { id_rol }, select });
};

module.exports = { listar, buscar, obtener, crear, actualizar, eliminar, activarDesactivar, asignarRol };
