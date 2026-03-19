const { Router } = require('express');
const controller = require('./controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermiso = require('../../middlewares/checkPermiso');

const router = Router();

const auth = [verifyToken, checkPermiso('dashboard.ver')];

router.get('/ventas-por-mes',       ...auth, controller.ventasPorMes);
router.get('/ventas-por-dia',       ...auth, controller.ventasPorDia);
router.get('/ventas-por-semana',    ...auth, controller.ventasPorSemana);
router.get('/productos-mas-vendidos', ...auth, controller.productosMasVend);
router.get('/total-dia',            ...auth, controller.totalDia);
router.get('/totalidad-clientes',   ...auth, controller.totalidadClientes);
router.get('/recaudo-pedidos',      ...auth, controller.recaudoPedidos);

module.exports = router;
