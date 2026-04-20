const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function seed() {
  await p.estado.createMany({data:[
    {nombre_estado:'pendiente', descripcion:'Venta recién creada'},
    {nombre_estado:'en_proceso', descripcion:'En preparación'},
    {nombre_estado:'listo', descripcion:'Listo para entregar'},
    {nombre_estado:'entregado', descripcion:'Entregado al cliente'},
    {nombre_estado:'anulado', descripcion:'Venta anulada'},
    {nombre_estado:'despachado', descripcion:'Pedido despachado por el domiciliario'}
  ], skipDuplicates:true});
  console.log('Estados OK');

  await p.metodoPago.createMany({data:[
    {nombre:'efectivo', descripcion:'Pago en efectivo', estado:1},
    {nombre:'transferencia', descripcion:'Pago por transferencia', estado:1},
    {nombre:'mixto', descripcion:'Pago mixto', estado:1}
  ], skipDuplicates:true});
  console.log('Métodos de pago OK');

  await p.rol.createMany({data:[
    {nombre:'admin', descripcion:'Administrador del sistema'},
    {nombre:'domiciliario', descripcion:'Entrega de pedidos a domicilio'},
    {nombre:'confirmador_domicilio', descripcion:'Confirma y gestiona el estado de los domicilios'},
    {nombre:'cliente', descripcion:'Cliente de la tienda'}
  ], skipDuplicates:true});
  console.log('Roles OK');

  const hash = await bcrypt.hash('123456', 10);
  await p.usuario.createMany({data:[
    {nombre:'Administrador', email:'samuel@gmail.com', contrasena:hash, id_rol:1, estado:1},
    {nombre:'Carlos Domiciliario', email:'domi@gmail.com', contrasena:hash, id_rol:2, estado:1},
    {nombre:'pepito perez', email:'pepito@gmail.com', contrasena:hash, id_rol:4, estado:1}
  ], skipDuplicates:true});
  console.log('Usuarios OK');

  console.log('✅ Seed completado');
}

seed().catch(console.error).finally(() => p.$disconnect());
