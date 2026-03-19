const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');

const incUsuario = { usuario: { select: { nombre: true, email: true, rol: true } } };

const listar = () => prisma.empleado.findMany({ include: incUsuario });

const buscar = (q) => prisma.empleado.findMany({
  where: {
    OR: [
      { cargo: { contains: q, mode: 'insensitive' } },
      { usuario: { nombre: { contains: q, mode: 'insensitive' } } },
    ],
  },
  include: incUsuario,
});

const obtener = async (id) => {
  const e = await prisma.empleado.findUnique({ where: { id_empleado: id }, include: incUsuario });
  if (!e) throw { status: 404, message: 'Empleado no encontrado' };
  return e;
};

const crear = async ({ nombre, email, contrasena, id_rol, cargo, fecha_ingreso }) => {
  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) throw { status: 409, message: 'El email ya está registrado' };
  const hash = await bcrypt.hash(contrasena, 10);
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: { nombre, email, contrasena: hash, id_rol, estado: 1 },
    });
    return tx.empleado.create({
      data: { id_usuario: usuario.id_usuario, cargo, fecha_ingreso: new Date(fecha_ingreso), estado: 1 },
      include: incUsuario,
    });
  });
};

const actualizar = async (id, datos) => {
  await obtener(id);
  return prisma.empleado.update({ where: { id_empleado: id }, data: datos, include: incUsuario });
};

const eliminar = async (id) => {
  const e = await obtener(id);
  return prisma.usuario.delete({ where: { id_usuario: e.id_usuario } });
};

const cambiarEstado = async (id, estado) => {
  await obtener(id);
  return prisma.empleado.update({ where: { id_empleado: id }, data: { estado }, include: incUsuario });
};

module.exports = { listar, buscar, obtener, crear, actualizar, eliminar, cambiarEstado };
