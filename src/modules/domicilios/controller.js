const service = require('./service');
const { asignarDomicilioSchema, estadoDomicilioSchema } = require('./schema');
const { success } = require('../../utils/response');

const listar        = async (req, res, next) => { try { success(res, await service.listar()); } catch (e) { next(e); } };
const filtrar       = async (req, res, next) => { try { success(res, await service.filtrar(req.query.estado)); } catch (e) { next(e); } };
const obtener       = async (req, res, next) => { try { success(res, await service.obtener(Number(req.params.id))); } catch (e) { next(e); } };
const asignar       = async (req, res, next) => { try { success(res, await service.asignar(asignarDomicilioSchema.parse(req.body)), 'Domicilio asignado', 201); } catch (e) { next(e); } };
const cambiarEstado = async (req, res, next) => { try { success(res, await service.cambiarEstado(Number(req.params.id), estadoDomicilioSchema.parse(req.body)), 'Estado actualizado'); } catch (e) { next(e); } };
const misPedidos    = async (req, res, next) => { try { success(res, await service.misPedidos(req.user.id_usuario)); } catch (e) { next(e); } };
const coger         = async (req, res, next) => { try { success(res, await service.coger(Number(req.params.id), req.user.id_usuario), 'Pedido tomado'); } catch (e) { next(e); } };
const despachar     = async (req, res, next) => { try { success(res, await service.despachar(Number(req.params.id), req.body.observaciones), 'Pedido despachado'); } catch (e) { next(e); } };
const entregar      = async (req, res, next) => { try { success(res, await service.entregar(Number(req.params.id), req.body.observaciones), 'Pedido entregado'); } catch (e) { next(e); } };

module.exports = { listar, filtrar, obtener, asignar, cambiarEstado, misPedidos, coger, despachar, entregar };
