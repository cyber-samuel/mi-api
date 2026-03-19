const prisma = require('../../config/prisma');

const incUsuario = { usuario: { select: { nombre: true, email: true, estado: true } } };

const listar = () => prisma.cliente.findMany({ include: incUsuario });

const buscar = (q) => prisma.cliente.findMany({
  where: {
    OR: [
      { usuario: { nombre: { contains: q, mode: 'insensitive' } } },
      { usuario: { email:  { contains: q, mode: 'insensitive' } } },
      { telefono: { contains: q, mode: 'insensitive' } },
    ],
  },
  include: incUsuario,
});

const obtener = async (id) => {
  const c = await prisma.cliente.findUnique({ where: { id_cliente: id }, include: incUsuario });
  if (!c) throw { status: 404, message: 'Cliente no encontrado' };
  return c;
};

const actualizar = async (id, datos) => {
  await obtener(id);
  return prisma.cliente.update({ where: { id_cliente: id }, data: datos, include: incUsuario });
};

const eliminar = async (id) => {
  const c = await obtener(id);
  return prisma.usuario.delete({ where: { id_usuario: c.id_usuario } });
};

const cambiarEstado = async (id, estado) => {
  const c = await obtener(id);
  return prisma.usuario.update({
    where: { id_usuario: c.id_usuario },
    data: { estado },
    select: { id_usuario: true, nombre: true, email: true, estado: true },
  });
};

const historialPedidos = async (id) => {
  await obtener(id);
  return prisma.venta.findMany({
    where: { id_cliente: id },
    include: {
      estado: true,
      detalleVentas: { include: { producto: true } },
    },
    orderBy: { fecha: 'desc' },
  });
};

const toppingsFavoritos = async (id) => {
  await obtener(id);
  const agrupados = await prisma.detalleTopping.groupBy({
    by: ['id_topping'],
    where: { detalleVenta: { venta: { id_cliente: id } } },
    _count: { id_topping: true },
    orderBy: { _count: { id_topping: 'desc' } },
    take: 5,
  });
  const ids = agrupados.map((r) => r.id_topping);
  const toppings = await prisma.topping.findMany({ where: { id_topping: { in: ids } } });
  const map = Object.fromEntries(toppings.map((t) => [t.id_topping, t]));
  return agrupados.map((r) => ({ topping: map[r.id_topping], veces_pedido: r._count.id_topping }));
};

const adicionesFavoritas = async (id) => {
  await obtener(id);
  const agrupados = await prisma.detalleAdicion.groupBy({
    by: ['id_adicion'],
    where: { detalleVenta: { venta: { id_cliente: id } } },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 5,
  });
  const ids = agrupados.map((r) => r.id_adicion);
  const adiciones = await prisma.adicion.findMany({ where: { id_adicion: { in: ids } } });
  const map = Object.fromEntries(adiciones.map((a) => [a.id_adicion, a]));
  return agrupados.map((r) => ({ adicion: map[r.id_adicion], cantidad_total: r._sum.cantidad }));
};

const perfil = async (id) => {
  const c = await prisma.cliente.findUnique({
    where: { id_cliente: id },
    include: {
      usuario: { select: { nombre: true, email: true, estado: true, fecha_registro: true, rol: true } },
      direcciones: true,
    },
  });
  if (!c) throw { status: 404, message: 'Cliente no encontrado' };
  return c;
};

const listarDirecciones = async (id) => { await obtener(id); return prisma.direccion.findMany({ where: { id_cliente: id } }); };
const crearDireccion    = async (id, datos) => { await obtener(id); return prisma.direccion.create({ data: { ...datos, id_cliente: id, estado: 1 } }); };

module.exports = { listar, buscar, obtener, actualizar, eliminar, cambiarEstado,
  historialPedidos, toppingsFavoritos, adicionesFavoritas, perfil, listarDirecciones, crearDireccion };
