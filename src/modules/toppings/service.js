const prisma = require('../../config/prisma');

const listar       = ()  => prisma.topping.findMany({ orderBy: { nombre: 'asc' } });
const listarActivos = () => prisma.topping.findMany({ where: { estado: 1 }, orderBy: { nombre: 'asc' } });

const obtener = async (id) => {
  const t = await prisma.topping.findUnique({ where: { id_topping: id } });
  if (!t) throw { status: 404, message: 'Topping no encontrado' };
  return t;
};

const crear        = (datos) => prisma.topping.create({ data: { ...datos, estado: 1 } });
const actualizar   = async (id, datos) => { await obtener(id); return prisma.topping.update({ where: { id_topping: id }, data: datos }); };
const eliminar     = async (id) => {
  await obtener(id);
  const enUso = await prisma.detalleTopping.count({ where: { id_topping: id } });
  if (enUso > 0) throw { status: 409, message: `No se puede eliminar: está usado en ${enUso} pedido(s).` };
  return prisma.topping.delete({ where: { id_topping: id } });
};
const cambiarEstado = async (id, estado) => { await obtener(id); return prisma.topping.update({ where: { id_topping: id }, data: { estado } }); };

module.exports = { listar, listarActivos, obtener, crear, actualizar, eliminar, cambiarEstado };
