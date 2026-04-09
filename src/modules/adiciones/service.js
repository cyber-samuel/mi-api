const prisma = require('../../config/prisma');

const listar        = ()  => prisma.adicion.findMany({ orderBy: { nombre: 'asc' } });
const listarActivas = () => prisma.adicion.findMany({ where: { estado: 1 }, orderBy: { nombre: 'asc' } });

const obtener = async (id) => {
  const a = await prisma.adicion.findUnique({ where: { id_adicion: id } });
  if (!a) throw { status: 404, message: 'Adición no encontrada' };
  return a;
};

const crear        = (datos) => prisma.adicion.create({ data: { ...datos, estado: 1 } });
const actualizar   = async (id, datos) => { await obtener(id); return prisma.adicion.update({ where: { id_adicion: id }, data: datos }); };
const eliminar     = async (id) => { await obtener(id); return prisma.adicion.delete({ where: { id_adicion: id } }); };
const cambiarEstado = async (id, estado) => { await obtener(id); return prisma.adicion.update({ where: { id_adicion: id }, data: { estado } }); };

module.exports = { listar, listarActivas, obtener, crear, actualizar, eliminar, cambiarEstado };
