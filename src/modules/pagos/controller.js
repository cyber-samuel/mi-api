const service = require('./service');
const { crearPagoSchema, crearMetodoPagoSchema } = require('./schema');
const { success } = require('../../utils/response');

const obtener = async (req, res, next) => {
  try { success(res, await service.obtener(Number(req.params.id))); }
  catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const datos = crearPagoSchema.parse(req.body);
    success(res, await service.crear(datos), 'Pago registrado', 201);
  } catch (err) { next(err); }
};

const listarMetodos = async (req, res, next) => {
  try { success(res, await service.listarMetodos()); }
  catch (err) { next(err); }
};

const crearMetodo = async (req, res, next) => {
  try {
    const datos = crearMetodoPagoSchema.parse(req.body);
    success(res, await service.crearMetodo(datos), 'Método de pago creado', 201);
  } catch (err) { next(err); }
};

module.exports = { obtener, crear, listarMetodos, crearMetodo };
