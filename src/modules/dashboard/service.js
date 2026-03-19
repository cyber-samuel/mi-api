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

const ventasPorDia = async () => {
  return prisma.$queryRaw`
    SELECT
      DATE(fecha)            AS dia,
      COUNT(*)::int          AS total_ventas,
      COALESCE(SUM(total),0) AS monto_total
    FROM ventas
    WHERE fecha >= NOW() - INTERVAL '30 days'
      AND id_estado != (SELECT id_estado FROM estados WHERE nombre_estado = 'anulado' LIMIT 1)
    GROUP BY dia
    ORDER BY dia DESC
  `;
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

const totalDia = async () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const estadoAnulado = await prisma.estado.findFirst({ where: { nombre_estado: 'anulado' } });

  const result = await prisma.venta.aggregate({
    where: {
      fecha:     { gte: hoy, lt: manana },
      id_estado: { not: estadoAnulado?.id_estado },
    },
    _sum:   { total: true },
    _count: { id_venta: true },
  });

  return {
    fecha:        hoy.toISOString().split('T')[0],
    total_ventas: result._count.id_venta,
    monto_total:  result._sum.total || 0,
  };
};

const totalidadClientes = async () => {
  const total    = await prisma.cliente.count();
  const activos  = await prisma.usuario.count({ where: { id_rol: 4, estado: 1 } });
  return { total_clientes: total, clientes_activos: activos };
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

module.exports = { ventasPorMes, ventasPorDia, ventasPorSemana, productosMasVendidos,
  totalDia, totalidadClientes, recaudoPedidos };
