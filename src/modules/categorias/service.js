const prisma = require('../../config/prisma');

const listar  = ()       => prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
const buscar  = (q)      => prisma.categoria.findMany({ where: { nombre: { contains: q, mode: 'insensitive' } } });

const obtener = async (id) => {
  const c = await prisma.categoria.findUnique({ where: { id_categoria: id }, include: { productos: true } });
  if (!c) throw { status: 404, message: 'Categoría no encontrada' };
  return c;
};

const crear = (datos) => prisma.categoria.create({ data: { ...datos, estado: 1 } });

const actualizar = async (id, datos) => {
  await obtener(id);
  return prisma.categoria.update({ where: { id_categoria: id }, data: datos });
};

const eliminar = async (id) => {
  await obtener(id);
  const enUso = await prisma.producto.count({ where: { id_categoria: id } });
  if (enUso > 0) throw { status: 409, message: `No se puede eliminar: tiene ${enUso} producto(s) asociado(s). Desactívala en su lugar.` };
  return prisma.categoria.delete({ where: { id_categoria: id } });
};

const cambiarEstado = async (id, estado) => {
  await obtener(id);
  return prisma.categoria.update({ where: { id_categoria: id }, data: { estado } });
};

module.exports = { listar, buscar, obtener, crear, actualizar, eliminar, cambiarEstado };
