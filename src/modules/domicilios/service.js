const prisma = require('../../config/prisma');

const inc = {
  empleado:        { include: { usuario: { select: { nombre: true } } } },
  venta:           { include: { cliente: { include: { usuario: { select: { nombre: true } } } } } },
  estadoDomicilio: true,
};

const listar  = () => prisma.ventaDomiciliario.findMany({ include: inc, orderBy: { hora_asignacion: 'desc' } });
const filtrar  = (estadoId) => prisma.ventaDomiciliario.findMany({ where: { id_estado_domicilio: Number(estadoId) }, include: inc });

const obtener = async (id) => {
  const d = await prisma.ventaDomiciliario.findUnique({ where: { id_venta_domiciliario: id }, include: inc });
  if (!d) throw { status: 404, message: 'Domicilio no encontrado' };
  return d;
};

const asignar = (datos) =>
  prisma.ventaDomiciliario.create({ data: { ...datos, hora_asignacion: new Date() }, include: inc });

const cambiarEstado = async (id, datos) => {
  await obtener(id);
  return prisma.ventaDomiciliario.update({ where: { id_venta_domiciliario: id }, data: datos, include: inc });
};

// Pedidos asignados al domiciliario autenticado
const misPedidos = async (id_usuario) => {
  const empleado = await prisma.empleado.findUnique({ where: { id_usuario } });
  if (!empleado) throw { status: 404, message: 'Empleado no encontrado para este usuario' };
  return prisma.ventaDomiciliario.findMany({
    where:   { id_empleado: empleado.id_empleado },
    include: inc,
    orderBy: { hora_asignacion: 'desc' },
  });
};

// Domiciliario auto-asigna un pedido (crea registro si no existe, o actualiza si ya hay uno sin empleado)
const coger = async (id_venta_domiciliario, id_usuario) => {
  const empleado = await prisma.empleado.findUnique({ where: { id_usuario } });
  if (!empleado) throw { status: 404, message: 'Empleado no encontrado para este usuario' };
  const domicilio = await obtener(id_venta_domiciliario);
  if (domicilio.id_empleado && domicilio.id_empleado !== empleado.id_empleado) {
    throw { status: 409, message: 'Este pedido ya fue tomado por otro domiciliario' };
  }
  const estadoEnCamino = await prisma.estadoDomicilio.findFirst({
    where: { nombre_estado: { in: ['en_camino', 'en camino', 'asignado', 'recogido'] } },
  });
  return prisma.ventaDomiciliario.update({
    where: { id_venta_domiciliario: id_venta_domiciliario },
    data:  {
      id_empleado:         empleado.id_empleado,
      hora_asignacion:     new Date(),
      id_estado_domicilio: estadoEnCamino?.id_estado_domicilio ?? domicilio.id_estado_domicilio,
    },
    include: inc,
  });
};

// Marcar como despachado (salió a entregar)
const despachar = async (id, observaciones) => {
  await obtener(id);
  const estado = await prisma.estadoDomicilio.findFirst({
    where: { nombre_estado: { in: ['despachado', 'en camino', 'en_camino'] } },
  });
  return prisma.ventaDomiciliario.update({
    where: { id_venta_domiciliario: id },
    data:  {
      hora_salida:         new Date(),
      id_estado_domicilio: estado?.id_estado_domicilio ?? 2,
      ...(observaciones ? { observaciones } : {}),
    },
    include: inc,
  });
};

// Marcar como entregado/facturado
const entregar = async (id, observaciones) => {
  const domicilio = await obtener(id);
  const estado = await prisma.estadoDomicilio.findFirst({
    where: { nombre_estado: { in: ['entregado', 'facturado', 'completado'] } },
  });
  // También actualizar el estado de la venta a "facturado" o "entregado"
  const estadoVenta = await prisma.estado.findFirst({
    where: { nombre_estado: { in: ['facturado', 'entregado', 'completado'] } },
  });
  return prisma.$transaction(async (tx) => {
    if (estadoVenta && domicilio?.id_venta) {
      await tx.venta.update({
        where: { id_venta: domicilio.id_venta },
        data:  { id_estado: estadoVenta.id_estado },
      });
    }
    return tx.ventaDomiciliario.update({
      where: { id_venta_domiciliario: id },
      data:  {
        hora_entrega:        new Date(),
        id_estado_domicilio: estado?.id_estado_domicilio ?? 3,
        ...(observaciones ? { observaciones } : {}),
      },
      include: inc,
    });
  });
};

module.exports = { listar, filtrar, obtener, asignar, cambiarEstado, misPedidos, coger, despachar, entregar };
