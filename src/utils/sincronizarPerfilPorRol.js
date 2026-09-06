// Mantiene en sincronía Usuario.rol con los registros Empleado/Cliente
// correspondientes, cada vez que el rol de un usuario cambia (desde
// Usuarios o desde Empleados). Usuario.rol es la fuente de verdad de a
// dónde entra la persona al iniciar sesión -- este helper solo ajusta los
// perfiles (Empleado/Cliente) para que coincidan con lo que el rol ya dice.
//
// Reglas (confirmadas 2026-09-06):
// - Rol hacia un cargo operativo (domiciliario/cocinero/confirmador):
//   reutiliza el registro Empleado existente si lo hay (lo reactiva y le
//   actualiza el cargo), o crea uno nuevo si nunca existió. Cualquier
//   Cliente activo de esa persona se desactiva (no se borra).
// - Rol hacia "cliente": reutiliza el Cliente existente si lo hay (lo
//   reactiva), o crea uno nuevo. Cualquier Empleado activo se desactiva
//   (no se borra) -- se conserva el historial de ventas/domicilios que
//   haya procesado.
// - Nunca se elimina un registro Empleado/Cliente aquí, solo se
//   crea/reactiva/desactiva -- borrar en cascada sin cuidado ya había dado
//   problemas antes en este proyecto.
//
// EXCEPCIÓN "admin" (decisión de negocio, confirmada 2026-09-06): aunque
// 'admin' es un rol de tipo empleado para permisos (ver checkRolAdmin en
// middlewares/checkPermiso.js), las cuentas admin/dueño del sistema NO
// reciben un registro Empleado aquí. Motivo: evitar mezclar cuentas
// admin con el personal operativo real en la tabla/pantalla de Empleados,
// y evitar inventarles una fecha_ingreso falsa (nunca fueron contratados
// como empleados). Verificado que login, JWT y checkPermiso/checkRolAdmin
// usan exclusivamente Usuario.rol -- nunca consultan Empleado -- así que
// esta excepción no afecta permisos ni enrutamiento de un admin.
// Sí se les desactiva un Cliente activo colgado, igual que a cualquiera.

const ROLES_EMPLEADO_CON_PERFIL = ['domiciliario', 'cocinero', 'confirmador_domicilio'];
const CARGO_MAP = { domiciliario: 'Domiciliario', cocinero: 'Cocinero', confirmador_domicilio: 'Confirmador' };

async function sincronizarPerfilPorRol(tx, id_usuario, rolNombre) {
  if (ROLES_EMPLEADO_CON_PERFIL.includes(rolNombre)) {
    const cargo = CARGO_MAP[rolNombre];
    const existente = await tx.empleado.findFirst({ where: { id_usuario } });
    if (existente) {
      await tx.empleado.update({ where: { id_empleado: existente.id_empleado }, data: { cargo, estado: 1 } });
    } else {
      await tx.empleado.create({ data: { id_usuario, cargo, fecha_ingreso: new Date(), estado: 1 } });
    }
    await tx.cliente.updateMany({ where: { id_usuario, estado: 1 }, data: { estado: 0 } });
  } else if (rolNombre === 'cliente') {
    const existente = await tx.cliente.findFirst({ where: { id_usuario } });
    if (!existente) {
      await tx.cliente.create({ data: { id_usuario, estado: 1 } });
    } else if (existente.estado !== 1) {
      await tx.cliente.update({ where: { id_cliente: existente.id_cliente }, data: { estado: 1 } });
    }
    await tx.empleado.updateMany({ where: { id_usuario, estado: 1 }, data: { estado: 0 } });
  } else if (rolNombre === 'admin') {
    // Excepción documentada arriba: no se crea/gestiona Empleado para admin.
    await tx.cliente.updateMany({ where: { id_usuario, estado: 1 }, data: { estado: 0 } });
  }
}

module.exports = { sincronizarPerfilPorRol, ROLES_EMPLEADO_CON_PERFIL, CARGO_MAP };
