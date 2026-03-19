const service = require('./service');
const { asignarDomicilioSchema, estadoDomicilioSchema } = require('./schema');
const { success } = require('../../utils/response');

const listar       = async (req, res, next) => { try { success(res, await service.listar()); } catch (e) { next(e); } };
const filtrar      = async (req, res, next) => { try { success(res, await service.filtrar(req.query.estado)); } catch (e) { next(e); } };
const obtener      = async (req, res, next) => { try { success(res, await service.obtener(Number(req.params.id))); } catch (e) { next(e); } };
const asignar      = async (req, res, next) => { try { success(res, await service.asignar(asignarDomicilioSchema.parse(req.body)), 'Domicilio asignado', 201); } catch (e) { next(e); } };
const cambiarEstado= async (req, res, next) => { try { success(res, await service.cambiarEstado(Number(req.params.id), estadoDomicilioSchema.parse(req.body)), 'Estado actualizado'); } catch (e) { next(e); } };

module.exports = { listar, filtrar, obtener, asignar, cambiarEstado };
