const { z } = require('zod');
// gramaje es .nullable() además de .optional() -- ver el mismo comentario
// en toppings/schema.js. El formulario (Adiciones.jsx) manda `gramaje: null`
// cuando el campo queda vacío, y Zod .optional() solo acepta `undefined`.
const crearAdicionSchema = z.object({
  nombre:      z.string().min(2).max(100),
  descripcion: z.string().max(150).optional(),
  img:         z.string().max(255).optional(),
  gramaje:     z.string().max(50).optional().nullable(),
  precio:      z.number().positive(),
});

const estadoAdicionSchema = z.object({
  estado: z.number().int().min(0).max(1),
});

module.exports = { crearAdicionSchema, estadoAdicionSchema };
