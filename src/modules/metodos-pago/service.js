const prisma = require('../../config/prisma');

const listar = () => prisma.metodoPago.findMany({ orderBy: { nombre: 'asc' } });

const crear = (datos) => prisma.metodoPago.create({ data: { ...datos, estado: 1 } });

const actualizar = async (id, datos) => {
  const m = await prisma.metodoPago.findUnique({ where: { id_metodo_pago: id } });
  if (!m) throw { status: 404, message: 'Método de pago no encontrado' };
  return prisma.metodoPago.update({ where: { id_metodo_pago: id }, data: datos });
};

const cambiarEstado = async (id, estado) => {
  const m = await prisma.metodoPago.findUnique({ where: { id_metodo_pago: id } });
  if (!m) throw { status: 404, message: 'Método de pago no encontrado' };
  return prisma.metodoPago.update({ where: { id_metodo_pago: id }, data: { estado } });
};

module.exports = { listar, crear, actualizar, cambiarEstado };
