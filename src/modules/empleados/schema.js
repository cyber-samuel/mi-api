const { z } = require('zod');

// id_rol NO es un campo del formulario -- el frontend (Empleados.jsx) solo
// envía `cargo`, y service.crear() ya traduce cargo -> rol correcto vía
// CARGO_A_ROL. Un default aquí (antes: .default(2), "domiciliario") hacía que
// esa traducción nunca se ejecutara: `id_rol` llegaba siempre con un valor
// truthy y el service tomaba ese atajo en vez de mirar `cargo`, dejando a
// TODO empleado nuevo con rol domiciliario sin importar el cargo elegido
// (bug reproducido con Cocinero y Confirmador, confirmado 2026-09-06).
const crearEmpleadoSchema = z.object({
  nombre:        z.string().min(2),
  email:         z.string().email(),
  contrasena:    z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  cargo:         z.string().max(50),
  fecha_ingreso: z.string(),
});

const actualizarEmpleadoSchema = z.object({
  nombre:        z.string().min(2).max(100).optional(),
  email:         z.string().email().optional(),
  cargo:         z.string().max(50).optional(),
  fecha_ingreso: z.string().optional(),
  estado:        z.number().int().min(0).max(1).optional(),
});

const estadoEmpleadoSchema = z.object({
  estado: z.number().int().min(0).max(1),
});

module.exports = { crearEmpleadoSchema, actualizarEmpleadoSchema, estadoEmpleadoSchema };
