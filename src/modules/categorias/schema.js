const { z } = require('zod');

const crearCategoriaSchema = z.object({
  nombre:      z.string().min(2).max(100),
  descripcion: z.string().max(150).optional(),
});

module.exports = { crearCategoriaSchema };
