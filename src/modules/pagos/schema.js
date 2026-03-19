const { z } = require('zod');

const crearPagoSchema = z.object({
  id_venta:    z.number().int().positive(),
  id_empleado: z.number().int().positive(),
  metodos: z.array(z.object({
    id_metodo_pago: z.number().int().positive(),
    monto:          z.number().positive(),
    comprobante:    z.string().max(50).optional(),
    referencia:     z.string().max(100).optional(),
  })).min(1, 'Debe incluir al menos un método de pago'),
});

const crearMetodoPagoSchema = z.object({
  nombre:      z.string().min(2).max(50),
  descripcion: z.string().max(150).optional(),
});

module.exports = { crearPagoSchema, crearMetodoPagoSchema };
