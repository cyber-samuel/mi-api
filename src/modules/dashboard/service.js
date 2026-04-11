const prisma = require('../../config/prisma');

const ventasPorMes = async () => {
  return prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR  FROM fecha)::int AS año,
      EXTRACT(MONTH FROM fecha)::int AS mes,
      COUNT(*)::int                  AS total_ventas,
      COALESCE(SUM(total), 0)        AS monto_total
    FROM ventas
    WHERE id_estado != (SELECT id_estado FROM estados WHERE nombre_estado = 'anulado' LIMIT 1)
    GROUP BY año, mes
    ORDER BY año DESC, mes DESC
    LIMIT 12
  `;
};

const ventasPorDia = async (fecha) => {
  const fechaCO = fecha || new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const inicio  = new Date(fechaCO + 'T05:00:00.000Z');
  const fin     = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  const estadoAnulado = await prisma.estado.findFirst({ where: { nombre_estado: 'anulado' } });
  const ventas = await prisma.venta.findMany({
    where: { fecha: { gte: inicio, lt: fin }, id_estado: { not: estadoAnulado?.id_estado } },
    select: { fecha: true, total: true },
  });

  const horas = {};
  ventas.forEach((v) => {
    const hora  = (new Date(v.fecha).getUTCHours() - 5 + 24) % 24;
    const label = hora + ':00';
    horas[label] = (horas[label] || 0) + Number(v.total);
  });

  if (Object.keys(horas).length === 0) return [{ label: '—', total: 0 }];
  return Object.entries(horas)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([label, total]) => ({ label, total }));
};

const ventasPorSemana = async () => {
  return prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM fecha)::int AS año,
      EXTRACT(WEEK FROM fecha)::int AS semana,
      COUNT(*)::int                 AS total_ventas,
      COALESCE(SUM(total),0)        AS monto_total
    FROM ventas
    WHERE fecha >= NOW() - INTERVAL '90 days'
      AND id_estado != (SELECT id_estado FROM estados WHERE nombre_estado = 'anulado' LIMIT 1)
    GROUP BY año, semana
    ORDER BY año DESC, semana DESC
    LIMIT 12
  `;
};

const productosMasVendidos = async () => {
  const agrupados = await prisma.detalleVenta.groupBy({
    by: ['id_producto'],
    _sum:   { cantidad: true },
    _count: { id_producto: true },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 10,
  });

  const ids = agrupados.map((r) => r.id_producto);
  const productos = await prisma.producto.findMany({ where: { id_producto: { in: ids } } });
  const map = Object.fromEntries(productos.map((p) => [p.id_producto, p]));

  return agrupados.map((r) => ({
    producto:      map[r.id_producto],
    total_vendido: r._sum.cantidad,
  }));
};

const totalDia = async (fecha) => {
  // Usa Colombia (UTC-5): medianoche Colombia = 05:00 UTC
  const fechaCO = fecha || new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const inicio  = new Date(fechaCO + 'T05:00:00.000Z');
  const fin     = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  const estadoAnulado = await prisma.estado.findFirst({ where: { nombre_estado: 'anulado' } });

  const result = await prisma.venta.aggregate({
    where: {
      fecha:     { gte: inicio, lt: fin },
      id_estado: { not: estadoAnulado?.id_estado },
    },
    _sum:   { total: true },
    _count: { id_venta: true },
  });

  return {
    fecha:        fechaCO,
    total_ventas: result._count.id_venta,
    monto_total:  result._sum.total || 0,
  };
};

const totalidadClientes = async (fecha) => {
  const fechaCO = fecha || new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const inicio  = new Date(fechaCO + 'T05:00:00.000Z');
  const fin     = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  const [total, nuevosHoy] = await Promise.all([
    prisma.usuario.count({ where: { estado: 1 } }),
    prisma.usuario.count({ where: { estado: 1, fecha_registro: { gte: inicio, lt: fin } } }),
  ]);
  return { total, nuevosHoy };
};

const recaudoPedidos = async () => {
  const result = await prisma.pago.aggregate({
    _sum:   { total_pagado: true },
    _count: { id_pago: true },
  });
  return {
    total_pagos:   result._count.id_pago,
    total_recaudo: result._sum.total_pagado || 0,
  };
};

const pedidosRecientes = async (limite = 10, fecha) => {
  const where = {};
  if (fecha) {
    const inicio = new Date(fecha + 'T05:00:00.000Z');
    const fin    = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
    where.fecha  = { gte: inicio, lte: fin };
  }
  return prisma.venta.findMany({
    take:    Number(limite),
    where,
    orderBy: { fecha: 'desc' },
    include: {
      estado:  true,
      cliente: { include: { usuario: { select: { nombre: true, email: true } } } },
    },
  });
};

module.exports = { ventasPorMes, ventasPorDia, ventasPorSemana, productosMasVendidos,
  totalDia, totalidadClientes, recaudoPedidos, pedidosRecientes };
