const { z } = require('zod');
const crearToppingSchema = z.object({
  nombre:      z.string().min(2).max(100),
  descripcion: z.string().max(150).optional(),
  img:         z.string().max(255).optional(),
});
module.exports = { crearToppingSchema };
