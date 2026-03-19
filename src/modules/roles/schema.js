const { z } = require('zod');

const crearRolSchema = z.object({
  nombre:      z.string().min(2).max(50),
  descripcion: z.string().max(150).optional(),
});

const asignarPermisosSchema = z.object({
  permisos: z.array(z.number().int().positive()).min(1),
});

module.exports = { crearRolSchema, asignarPermisosSchema };
