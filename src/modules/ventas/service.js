const prisma = require('../../config/prisma');

const includeDetalle = {
  cliente:  { include: { usuario: { select: { nombre: true, email: true } } } },
  estado:   true,
  direccion: true,
  detalleVentas: {
    include: {
      producto: true,
      detalleToppings:  { include: { topping: true } },
      detalleAdiciones: { include: { adicion: true } },
    },
  },
};

const listar = async ({ estado, fecha } = {}) => {
  const where = {};

  if (estado) {
    const estadoObj = await prisma.estado.findFirst({
      where: { nombre_estado: { equals: estado, mode: 'insensitive' } },
    });
    if (!estadoObj) return [];
    where.id_estado = estadoObj.id_estado;
  }

  if (fecha) {
    // Filtrar por día completo en hora Colombia (UTC-5): medianoche Colombia = 05:00 UTC
    const inicio = new Date(fecha + 'T05:00:00.000Z');
    const fin    = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
    where.fecha  = { gte: inicio, lte: fin };
  }

  return prisma.venta.findMany({ where, include: includeDetalle, orderBy: { fecha: 'desc' } });
};

const filtrar = (estadoId) => prisma.venta.findMany({
  where: { id_estado: Number(estadoId) },
  include: includeDetalle,
  orderBy: { fecha: 'desc' },
});

const obtener = async (id) => {
  const v = await prisma.venta.findUnique({ where: { id_venta: id }, include: includeDetalle });
  if (!v) throw { status: 404, message: 'Venta no encontrada' };
  return v;
};

const crear = async ({ id_cliente, id_direccion, costo_domicilio = 0, observaciones, items }) => {
  const productoIds = items.map((i) => i.id_producto);
  const productos   = await prisma.producto.findMany({ where: { id_producto: { in: productoIds } } });
  const precioP     = Object.fromEntries(productos.map((p) => [p.id_producto, Number(p.precio)]));

  const adicionIds  = items.flatMap((i) => (i.adiciones || []).map((a) => a.id_adicion));
  const adiciones   = adicionIds.length ? await prisma.adicion.findMany({ where: { id_adicion: { in: adicionIds } } }) : [];
  const precioA     = Object.fromEntries(adiciones.map((a) => [a.id_adicion, Number(a.precio)]));

  let subtotal = 0;
  const itemsCalc = items.map((item) => {
    const pu = precioP[item.id_producto];
    if (!pu) throw { status: 400, message: `Producto ${item.id_producto} no encontrado` };
    const adicionesCalc = (item.adiciones || []).map((a) => ({
      id_adicion: a.id_adicion, cantidad: a.cantidad,
      precio_unitario: precioA[a.id_adicion],
      subtotal: precioA[a.id_adicion] * a.cantidad,
    }));
    const itemSub = pu * item.cantidad + adicionesCalc.reduce((s, a) => s + a.subtotal, 0);
    subtotal += itemSub;
    return { ...item, precio_unitario: pu, subtotal: pu * item.cantidad, adicionesCalc };
  });

  const estadoPendiente = await prisma.estado.findFirst({ where: { nombre_estado: 'pendiente' } });

  return prisma.venta.create({
    data: {
      id_cliente, id_estado: estadoPendiente?.id_estado || 1,
      id_direccion, costo_domicilio, observaciones,
      subtotal, total: subtotal + Number(costo_domicilio),
      detalleVentas: {
        create: itemsCalc.map((item) => ({
          id_producto: item.id_producto, cantidad: item.cantidad,
          precio_unitario: item.precio_unitario, subtotal: item.subtotal,
          detalleToppings:  { create: (item.toppings || []).map((id_topping) => ({ id_topping })) },
          detalleAdiciones: { create: item.adicionesCalc.map((a) => ({
            id_adicion: a.id_adicion, cantidad: a.cantidad,
            precio_unitario: a.precio_unitario, subtotal: a.subtotal,
          })) },
        })),
      },
    },
    include: includeDetalle,
  });
};

const cambiarEstado = async (id, { id_estado, nombre_estado }) => {
  await obtener(id);
  let estadoId = id_estado;
  if (!estadoId && nombre_estado) {
    const estado = await prisma.estado.findFirst({ where: { nombre_estado } });
    if (!estado) throw { status: 400, message: `Estado '${nombre_estado}' no existe` };
    estadoId = estado.id_estado;
  }
  return prisma.venta.update({ where: { id_venta: id }, data: { id_estado: estadoId }, include: includeDetalle });
};

const anular = async (id, motivo_anulacion) => {
  const venta = await obtener(id);
  if (venta.estado?.nombre_estado === 'anulado') throw { status: 400, message: 'La venta ya está anulada' };
  const estadoAnulado = await prisma.estado.findFirst({ where: { nombre_estado: 'anulado' } });
  return prisma.venta.update({
    where: { id_venta: id },
    data: { motivo_anulacion, id_estado: estadoAnulado?.id_estado },
    include: includeDetalle,
  });
};

const comprobante = async (id) => {
  const venta = await obtener(id);
  return {
    comprobante: {
      numero:        `VTA-${String(venta.id_venta).padStart(6, '0')}`,
      fecha:         venta.fecha,
      cliente:       venta.cliente?.usuario?.nombre,
      estado:        venta.estado?.nombre_estado,
      items:         venta.detalleVentas.map((d) => ({
        producto:   d.producto.nombre,
        cantidad:   d.cantidad,
        precio:     d.precio_unitario,
        subtotal:   d.subtotal,
        toppings:   d.detalleToppings.map((t) => t.topping.nombre),
        adiciones:  d.detalleAdiciones.map((a) => ({ nombre: a.adicion.nombre, cantidad: a.cantidad })),
      })),
      subtotal:      venta.subtotal,
      costo_domicilio: venta.costo_domicilio,
      total:         venta.total,
    },
  };
};

const whatsapp = async (id) => {
  const venta = await obtener(id);
  const num   = `VTA-${String(venta.id_venta).padStart(6, '0')}`;
  const msg   = encodeURIComponent(
    `*Comprobante ${num}*\n` +
    `Cliente: ${venta.cliente?.usuario?.nombre}\n` +
    `Total: $${Number(venta.total).toLocaleString('es-CO')}\n` +
    `Estado: ${venta.estado?.nombre_estado}\n` +
    `Fecha: ${new Date(venta.fecha).toLocaleString('es-CO')}`
  );
  return { url: `https://wa.me/?text=${msg}`, comprobante_numero: num };
};

const totalVenta = async (id) => {
  const v = await obtener(id);
  return { id_venta: id, subtotal: v.subtotal, costo_domicilio: v.costo_domicilio, total: v.total };
};

// Ventas del cliente autenticado
const misVentas = async (id_usuario) => {
  const cliente = await prisma.cliente.findUnique({ where: { id_usuario } });
  if (!cliente) return [];
  return prisma.venta.findMany({
    where: { id_cliente: cliente.id_cliente },
    include: includeDetalle,
    orderBy: { fecha: 'desc' },
  });
};

// Cliente crea su propio pedido (auto-crea perfil de cliente si no existe)
const crearMiPedido = async (id_usuario, { id_direccion, nueva_direccion, costo_domicilio = 3000, observaciones, items }) => {
  let cliente = await prisma.cliente.findUnique({ where: { id_usuario } });
  if (!cliente) {
    // Auto-crear perfil de cliente para cualquier usuario autenticado
    cliente = await prisma.cliente.create({ data: { id_usuario } });
  }

  let direccionId = id_direccion;
  if (!direccionId && nueva_direccion) {
    const dir = await prisma.direccion.create({
      data: {
        id_cliente:      cliente.id_cliente,
        direccion_linea: nueva_direccion.direccion_linea,
        barrio:          nueva_direccion.barrio       || null,
        ciudad:          nueva_direccion.ciudad       || null,
        departamento:    nueva_direccion.departamento || null,
        referencia:      nueva_direccion.referencia   || null,
        lat:             nueva_direccion.lat          || null,
        lng:             nueva_direccion.lng          || null,
      },
    });
    direccionId = dir.id_direccion;
  }

  return crear({ id_cliente: cliente.id_cliente, id_direccion: direccionId, costo_domicilio, observaciones, items });
};

module.exports = { listar, filtrar, obtener, crear, cambiarEstado, anular, comprobante, whatsapp, totalVenta, misVentas, crearMiPedido };
