const prisma = require('../../config/prisma');

const ventasPorMes = async () => {
  const año = new Date().getFullYear();
  const raw = await prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR  FROM fecha)::int AS año,
      EXTRACT(MONTH FROM fecha)::int AS mes,
      COALESCE(SUM(total), 0)        AS monto_total
    FROM ventas
    WHERE EXTRACT(YEAR FROM fecha) = ${año}
      AND id_estado != (SELECT id_estado FROM estados WHERE nombre_estado = 'anulado' LIMIT 1)
    GROUP BY año, mes
    ORDER BY mes ASC
  `;
  const meses = [];
  for (let m = 1; m <= 12; m++) {
    const found = raw.find((r) => Number(r.mes) === m);
    meses.push({ año, mes: m, monto_total: found ? found.monto_total : 0 });
  }
  return meses;
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
  for (let h = 0; h < 24; h++) horas[`${h}:00`] = 0;
  ventas.forEach((v) => {
    const hora  = (new Date(v.fecha).getUTCHours() - 5 + 24) % 24;
    const label = hora + ':00';
    horas[label] = horas[label] + Number(v.total);
  });

  const nonZero = Object.entries(horas).filter(([, t]) => t > 0);
  if (nonZero.length === 0) return [{ label: '—', total: 0 }];
  return nonZero
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([label, total]) => ({ label, total }));
};

const ventasPorSemana = async () => {
  const raw = await prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM fecha)::int AS año,
      EXTRACT(WEEK FROM fecha)::int AS semana,
      COALESCE(SUM(total),0)        AS monto_total
    FROM ventas
    WHERE fecha >= NOW() - INTERVAL '90 days'
      AND id_estado != (SELECT id_estado FROM estados WHERE nombre_estado = 'anulado' LIMIT 1)
    GROUP BY año, semana
    ORDER BY año DESC, semana DESC
    LIMIT 12
  `;
  // Build last 4 weeks always with 0 if no data
  const now = new Date();
  const semanas = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const año = d.getFullYear();
    const startOfYear = new Date(año, 0, 1);
    const semana = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const found = raw.find((r) => Number(r.año) === año && Number(r.semana) === semana);
    semanas.push({ año, semana, monto_total: found ? found.monto_total : 0 });
  }
  return semanas;
};

const productosMasVendidos = async () => {
  const estadosExcluidos = await prisma.estado.findMany({
    where: { nombre_estado: { in: ['anulado', 'pendiente'] } },
    select: { id_estado: true },
  });
  const idsExcluidos = estadosExcluidos.map((e) => e.id_estado);

  const agrupados = await prisma.detalleVenta.groupBy({
    by: ['id_producto'],
    where: { venta: { id_estado: { notIn: idsExcluidos } } },
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
  const estadoAnulado   = await prisma.estado.findFirst({ where: { nombre_estado: 'anulado' } });
  const estadoEntregado = await prisma.estado.findFirst({ where: { nombre_estado: 'entregado' } });

  const fechaWhere = fecha ? (() => {
    const inicio = new Date(fecha + 'T05:00:00.000Z');
    const fin    = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
    return { gte: inicio, lt: fin };
  })() : undefined;

  const [result, domicilios, pagos] = await Promise.all([
    prisma.venta.aggregate({
      where: { ...(fechaWhere ? { fecha: fechaWhere } : {}), id_estado: { not: estadoAnulado?.id_estado } },
      _sum:   { total: true },
      _count: { id_venta: true },
    }),
    prisma.venta.aggregate({
      where: { ...(fechaWhere ? { fecha: fechaWhere } : {}), id_estado: estadoEntregado?.id_estado },
      _sum: { costo_domicilio: true },
    }),
    prisma.detallePago.findMany({
      where: { pago: { venta: { ...(fechaWhere ? { fecha: fechaWhere } : {}), id_estado: estadoEntregado?.id_estado } } },
      include: { metodoPago: true },
    }),
  ]);

  const efectivo      = pagos.filter((p) => p.metodoPago?.nombre === 'efectivo').reduce((a, p) => a + Number(p.monto), 0);
  const transferencia = pagos.filter((p) => p.metodoPago?.nombre === 'transferencia').reduce((a, p) => a + Number(p.monto), 0);

  return {
    fecha:               fecha || null,
    total_ventas:        result._count.id_venta,
    monto_total:         result._sum.total || 0,
    total_efectivo:      efectivo,
    total_transferencia: transferencia,
    total_domicilios:    Number(domicilios._sum.costo_domicilio || 0),
  };
};

const domiciliariosDia = async (fecha) => {
  const fechaCO = fecha || new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const inicio  = new Date(fechaCO + 'T05:00:00.000Z');
  const fin     = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  const ventas = await prisma.venta.findMany({
    where: {
      fecha: { gte: inicio, lt: fin },
      estado: { nombre_estado: 'entregado' },
    },
    include: {
      ventasDomiciliario: { include: { empleado: { include: { usuario: true } } } },
      pagos: { include: { detallePagos: { include: { metodoPago: true } } } },
    },
  });

  const resumen = {};
  ventas.forEach((v) => {
    const domi = v.ventasDomiciliario?.[0]?.empleado?.usuario?.nombre || 'Sin asignar';
    if (!resumen[domi]) resumen[domi] = { nombre: domi, entregas: 0, efectivo: 0, transferencia: 0, total: 0 };
    resumen[domi].entregas++;
    resumen[domi].total += Number(v.total);
    v.pagos?.[0]?.detallePagos?.forEach((dp) => {
      if (dp.metodoPago?.nombre === 'efectivo')      resumen[domi].efectivo      += Number(dp.monto);
      if (dp.metodoPago?.nombre === 'transferencia') resumen[domi].transferencia += Number(dp.monto);
    });
  });
  return Object.values(resumen);
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
  totalDia, totalidadClientes, recaudoPedidos, pedidosRecientes, domiciliariosDia };
