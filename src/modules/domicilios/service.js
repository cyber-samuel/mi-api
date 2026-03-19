const prisma = require('../../config/prisma');

const inc = {
  empleado:        { include: { usuario: { select: { nombre: true } } } },
  venta:           { include: { cliente: { include: { usuario: { select: { nombre: true } } } } } },
  estadoDomicilio: true,
};

const listar  = () => prisma.ventaDomiciliario.findMany({ include: inc, orderBy: { hora_asignacion: 'desc' } });
const filtrar  = (estadoId) => prisma.ventaDomiciliario.findMany({ where: { id_estado_domicilio: Number(estadoId) }, include: inc });

const obtener = async (id) => {
  const d = await prisma.ventaDomiciliario.findUnique({ where: { id_venta_domiciliario: id }, include: inc });
  if (!d) throw { status: 404, message: 'Domicilio no encontrado' };
  return d;
};

const asignar = (datos) =>
  prisma.ventaDomiciliario.create({ data: { ...datos, hora_asignacion: new Date() }, include: inc });

const cambiarEstado = async (id, datos) => {
  await obtener(id);
  return prisma.ventaDomiciliario.update({ where: { id_venta_domiciliario: id }, data: datos, include: inc });
};

module.exports = { listar, filtrar, obtener, asignar, cambiarEstado };
