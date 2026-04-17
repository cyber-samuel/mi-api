const { z } = require('zod');

const itemVentaSchema = z.object({
  id_producto: z.number().int().positive(),
  cantidad:    z.number().int().positive(),
  toppings:    z.array(z.number().int().positive()).optional().default([]),
  adiciones:   z.array(z.object({
    id_adicion: z.number().int().positive(),
    cantidad:   z.number().int().positive(),
  })).optional().default([]),
});

const crearVentaSchema = z.object({
  id_cliente:      z.number().int().positive(),
  id_direccion:    z.number().int().positive().optional(),
  costo_domicilio: z.number().min(0).default(0),
  observaciones:   z.string().optional(),
  metodo_pago:     z.string().optional(),
  comprobante_url: z.string().url().optional().or(z.literal('')).nullable(),
  items:           z.array(itemVentaSchema).min(1, 'Debe incluir al menos un producto'),
});

const estadoVentaSchema = z.object({
  id_estado:           z.number().int().positive().optional(),
  nombre_estado:       z.string().optional(),
  metodo_pago:         z.string().optional(),
  monto_efectivo:      z.number().min(0).optional(),
  monto_transferencia: z.number().min(0).optional(),
  comprobante_url:     z.string().url().optional().or(z.literal('')).nullable(),
}).refine((d) => d.id_estado !== undefined || d.nombre_estado !== undefined, {
  message: 'Debe proporcionar id_estado o nombre_estado',
});

const anularVentaSchema = z.object({
  motivo_anulacion: z.string().min(5, 'Debe indicar el motivo de anulación'),
});

module.exports = { crearVentaSchema, estadoVentaSchema, anularVentaSchema };
