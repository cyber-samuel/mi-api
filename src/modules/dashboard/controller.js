const service = require('./service');
const { success } = require('../../utils/response');

const ventasPorMes      = async (req, res, next) => { try { success(res, await service.ventasPorMes());      } catch (e) { next(e); } };
const ventasPorDia      = async (req, res, next) => { try { success(res, await service.ventasPorDia());      } catch (e) { next(e); } };
const ventasPorSemana   = async (req, res, next) => { try { success(res, await service.ventasPorSemana());   } catch (e) { next(e); } };
const productosMasVend  = async (req, res, next) => { try { success(res, await service.productosMasVendidos()); } catch (e) { next(e); } };
const totalDia          = async (req, res, next) => { try { success(res, await service.totalDia());          } catch (e) { next(e); } };
const totalidadClientes = async (req, res, next) => { try { success(res, await service.totalidadClientes()); } catch (e) { next(e); } };
const recaudoPedidos    = async (req, res, next) => { try { success(res, await service.recaudoPedidos());    } catch (e) { next(e); } };

const pedidosRecientes = async (req, res, next) => { try { success(res, await service.pedidosRecientes(req.query.limite)); } catch (e) { next(e); } };

module.exports = { ventasPorMes, ventasPorDia, ventasPorSemana, productosMasVend,
  totalDia, totalidadClientes, recaudoPedidos, pedidosRecientes };
