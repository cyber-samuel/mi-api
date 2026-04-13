const { z } = require('zod');

const loginSchema = z.object({
  email:     z.string().email('Email inválido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nombre:    z.string().min(2),
  email:     z.string().email(),
  contrasena: z.string().min(6),
  id_rol:    z.number().int().positive(),
});

const recuperarSchema = z.object({
  email: z.string().email(),
});

const cambiarContrasenaSchema = z.object({
  token:            z.string().min(10),
  nueva_contrasena: z.string().min(6),
});

const editarPerfilSchema = z.object({
  nombre:   z.string().min(2).optional(),
  email:    z.string().email().optional(),
  telefono: z.string().min(7).max(20).optional(),
});

const solicitarResetSchema = z.object({
  email: z.string().email('Email inválido'),
});

const verificarResetSchema = z.object({
  email:           z.string().email('Email inválido'),
  codigo:          z.string().length(6, 'El código debe tener 6 dígitos'),
  nueva_password:  z.string().min(6, 'Mínimo 6 caracteres'),
});

module.exports = { loginSchema, registerSchema, recuperarSchema, cambiarContrasenaSchema, editarPerfilSchema,
                   solicitarResetSchema, verificarResetSchema };
