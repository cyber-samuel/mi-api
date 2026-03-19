const prisma = require('../../config/prisma');

const includeDetalle = {
  venta:    true,
  empleado: { include: { usuario: { select: { nombre: true } } } },
  detallePagos: { include: { metodoPago: true } },
};

const obtener = async (id) => {
  const p = await prisma.pago.findUnique({ where: { id_pago: id }, include: includeDetalle });
  if (!p) throw { status: 404, message: 'Pago no encontrado' };
  return p;
};

const crear = async ({ id_venta, id_empleado, metodos }) => {
  const total_pagado = metodos.reduce((acc, m) => acc + m.monto, 0);

  return prisma.pago.create({
    data: {
      id_venta,
      id_empleado,
      total_pagado,
      detallePagos: { create: metodos },
    },
    include: includeDetalle,
  });
};

const listarMetodos = () => prisma.metodoPago.findMany();

const crearMetodo = (datos) => prisma.metodoPago.create({ data: { ...datos, estado: 1 } });

module.exports = { obtener, crear, listarMetodos, crearMetodo };
