const { z } = require('zod');

const crearUsuarioSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  contrasena: z.string().min(6),
  id_rol: z.number().int().positive(),
  estado: z.number().int().min(0).max(1).default(1),
});

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  contrasena: z.string().min(6).optional(),
  id_rol: z.number().int().positive().optional(),
  estado: z.number().int().min(0).max(1).optional(),
});

module.exports = { crearUsuarioSchema, actualizarUsuarioSchema };
