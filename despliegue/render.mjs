// ============================================================================
//  Crea o actualiza el backend de Al Día en Render (plan gratuito) con su API.
//  Lo llama despliegue/desplegar.sh; los secretos llegan como variables de entorno
//  (leídas de despliegue/produccion.env) y nunca se imprimen.
//
//  Uso: node despliegue/render.mjs <rama-de-github>
// ============================================================================

const API = 'https://api.render.com/v1';
const NOMBRE = 'aldia-backend';
const REPOSITORIO = 'https://github.com/2510251000/Proyecto-Software';
const RUTA_SALUD = '/api/ubicacion/ciudades';
const ESPERA_MAXIMA_MS = 20 * 60 * 1000;

const rama = process.argv[2];
const e = process.env;
if (!rama) throw new Error('Falta la rama de GitHub');
if (!e.RENDER_API_KEY) throw new Error('Falta RENDER_API_KEY en despliegue/produccion.env');

const proyecto = e.FIREBASE_PROYECTO;
const variables = {
  PERFIL_ACTIVO: 'prod',
  DB_URL: e.DB_URL,
  DB_USUARIO: e.DB_USUARIO,
  DB_CONTRASENA: e.DB_CONTRASENA,
  JWT_CLAVE_SECRETA: e.JWT_CLAVE_SECRETA,
  JWT_EXPIRACION_MS: '86400000',
  CORS_ORIGENES: `https://${proyecto}.web.app,https://${proyecto}.firebaseapp.com`,
  FIREBASE_PROYECTO: proyecto,
  ADMIN_CORREO: e.ADMIN_CORREO,
  ADMIN_CONTRASENA: e.ADMIN_CONTRASENA,
  // Los autores de las noticias iniciales son las cuentas de demostración.
  FLYWAY_UBICACIONES: 'classpath:db/migration,classpath:db/demo',
  // El disco de Render gratis se borra al reiniciar: las fotos van a la base (Neon).
  IMAGENES_ALMACEN: 'base-datos',
  PUERTO: '8080',
  PORT: '8080',
  // Render gratis da 512 MB: JVM con montón acotado y un recolector liviano.
  JAVA_TOOL_OPTIONS: '-XX:MaxRAMPercentage=65 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1',
  SPRING_DATASOURCE_HIKARI_MAXIMUMPOOLSIZE: '4',
};
for (const [clave, valor] of Object.entries(variables)) {
  if (!valor) throw new Error(`Falta ${clave} en despliegue/produccion.env`);
}
const listaVariables = Object.entries(variables).map(([key, value]) => ({ key, value }));

async function render(metodo, ruta, cuerpo) {
  const respuesta = await fetch(API + ruta, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${e.RENDER_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const texto = await respuesta.text();
  if (!respuesta.ok) {
    throw new Error(`Render ${metodo} ${ruta}: ${respuesta.status} ${texto.slice(0, 300)}`);
  }
  return texto ? JSON.parse(texto) : null;
}

const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

const [{ owner }] = await render('GET', '/owners?limit=1');
const existentes = await render('GET', `/services?name=${NOMBRE}&ownerId=${owner.id}&limit=1`);
let servicio = existentes[0]?.service;
let despliegueId;

if (servicio === undefined) {
  console.log(`==> Creando ${NOMBRE} en Render (rama ${rama})`);
  const creado = await render('POST', '/services', {
    type: 'web_service',
    name: NOMBRE,
    ownerId: owner.id,
    repo: REPOSITORIO,
    branch: rama,
    autoDeploy: 'yes',
    envVars: listaVariables,
    serviceDetails: {
      runtime: 'docker',
      plan: 'free',
      region: 'virginia',
      healthCheckPath: RUTA_SALUD,
      envSpecificDetails: { dockerfilePath: './backend/Dockerfile', dockerContext: './backend' },
    },
  });
  servicio = creado.service;
  despliegueId = creado.deployId;
} else {
  console.log(`==> Actualizando ${NOMBRE} (rama ${rama})`);
  await render('PATCH', `/services/${servicio.id}`, { branch: rama });
  await render('PUT', `/services/${servicio.id}/env-vars`, listaVariables);
  despliegueId = (await render('POST', `/services/${servicio.id}/deploys`, { clearCache: 'do_not_clear' })).id;
}

const url = servicio.serviceDetails.url;
console.log(`==> Construyendo y arrancando (la primera vez tarda 5 a 10 minutos): ${url}`);
const inicio = Date.now();
let estado = '';
while (Date.now() - inicio < ESPERA_MAXIMA_MS) {
  await esperar(20000);
  const despliegues = await render('GET', `/services/${servicio.id}/deploys?limit=5`);
  const actual = despliegues.map((d) => d.deploy).find((d) => !despliegueId || d.id === despliegueId);
  if (actual && actual.status !== estado) {
    estado = actual.status;
    console.log(`    ${Math.round((Date.now() - inicio) / 1000)} s: ${estado}`);
  }
  if (['live'].includes(estado)) break;
  if (['build_failed', 'update_failed', 'canceled', 'pre_deploy_failed'].includes(estado)) {
    throw new Error(`El despliegue terminó en ${estado}. Revisa los registros en https://dashboard.render.com`);
  }
}
const salud = await fetch(url + RUTA_SALUD);
console.log(`==> Backend en ${url} → ${RUTA_SALUD} responde ${salud.status}`);
console.log(`URL_BACKEND=${url}`);
