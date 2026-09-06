const { z } = require('zod');
// gramaje es .nullable() además de .optional() porque el formulario
// (Toppings.jsx) manda `gramaje: null` explícito cuando el campo queda
// vacío -- Zod .optional() solo acepta `undefined`, nunca `null`, así que
// sin esto crear/editar un topping sin gramaje fallaba con un genérico
// "Error de validación" (auditoría 2026-09-06). Mismo patrón que ya usa
// productos/schema.js para sus campos opcionales.
const crearToppingSchema = z.object({
  nombre:      z.string().min(2).max(100),
  descripcion: z.string().max(150).optional(),
  img:         z.string().max(255).optional(),
  gramaje:     z.string().max(50).optional().nullable(),
});

const estadoToppingSchema = z.object({
  estado: z.number().int().min(0).max(1),
});

module.exports = { crearToppingSchema, estadoToppingSchema };
