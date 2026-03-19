const { z } = require('zod');

const actualizarEmpleadoSchema = z.object({
  cargo:         z.string().max(50).optional(),
  fecha_ingreso: z.string().datetime().optional(),
});

const estadoEmpleadoSchema = z.object({
  estado: z.number().int().min(0).max(1),
});

module.exports = { actualizarEmpleadoSchema, estadoEmpleadoSchema };
