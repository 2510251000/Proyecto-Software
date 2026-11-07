// ============================================================================
//  Al Día — prueba de carga del BACKEND (API REST) con k6
//
//  Simula vecinos usando la portada al mismo tiempo: piden el listado de
//  noticias, abren una, consultan su perfil y la campana de avisos. Aparte,
//  unos pocos usuarios inician sesión una y otra vez (el login cifra con
//  BCrypt y es lo más pesado de la API).
//
//  Se corre con pruebas/carga/correr-carga.ps1 -Parte backend
//  (usa la imagen de Docker grafana/k6; no hay que instalar k6).
//
//  Variables (todas opcionales):
//    BASE_URL     dirección del backend   (por defecto http://host.docker.internal:8080)
//    USUARIOS     usuarios simultáneos     (por defecto 50)
//    DURACION     tiempo con la carga llena (por defecto 1m)
// ============================================================================
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:8080';
const USUARIOS = Number(__ENV.USUARIOS || 50);
const DURACION = __ENV.DURACION || '1m';

// Cuentas de demostración que crea Flyway en el perfil dev (db/demo/R__datos_demo.sql).
const CUENTAS = [
  { correo: 'corresponsal@aldia.com', contrasena: 'Usuario12345' },
  { correo: 'activo@aldia.com', contrasena: 'Usuario12345' },
  { correo: 'vecina@aldia.com', contrasena: 'Usuario12345' },
  { correo: 'lector@aldia.com', contrasena: 'Usuario12345' },
];

// Tiempo de cada tipo de petición, para verlo por separado en el resumen.
const tiempoListado = new Trend('tiempo_listado', true);
const tiempoNoticia = new Trend('tiempo_noticia', true);
const tiempoPerfil = new Trend('tiempo_perfil', true);
const tiempoAvisos = new Trend('tiempo_avisos', true);
const tiempoLogin = new Trend('tiempo_login', true);

export const options = {
  scenarios: {
    // La mayoría: leen la portada. Suben poco a poco, se mantienen y bajan.
    lectura: {
      executor: 'ramping-vus',
      exec: 'leerPortada',
      startVUs: 0,
      stages: [
        { duration: '30s', target: USUARIOS },
        { duration: DURACION, target: USUARIOS },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
    // Unos pocos inician sesión sin parar.
    inicio_sesion: {
      executor: 'constant-vus',
      exec: 'iniciarSesion',
      vus: 5,
      duration: `${30 + parseDuracion(DURACION)}s`,
    },
  },
  thresholds: {
    // Menos del 1 % de peticiones fallidas y el 99 % de las comprobaciones bien.
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    // El 95 % de las lecturas responde en menos de medio segundo.
    tiempo_listado: ['p(95)<500'],
    tiempo_noticia: ['p(95)<500'],
    tiempo_perfil: ['p(95)<500'],
    tiempo_avisos: ['p(95)<500'],
    // El login es más lento a propósito (BCrypt): menos de 1,5 s para el 95 %.
    tiempo_login: ['p(95)<1500'],
  },
};

/** «1m» → 60, «90s» → 90. */
function parseDuracion(texto) {
  const valor = Number.parseInt(texto, 10);
  return texto.endsWith('m') ? valor * 60 : valor;
}

function login(cuenta) {
  return http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(cuenta), {
    headers: { 'Content-Type': 'application/json' },
    tags: { nombre: 'login' },
  });
}

/** Antes de la carga: un token por cuenta, para no medir el login dentro de la lectura. */
export function setup() {
  const tokens = CUENTAS.map((cuenta) => {
    const respuesta = login(cuenta);
    if (respuesta.status !== 200) {
      throw new Error(`No se pudo iniciar sesión con ${cuenta.correo} (estado ${respuesta.status}). ¿Está el backend en ${BASE_URL} con el perfil dev?`);
    }
    return respuesta.json('token');
  });
  return { tokens };
}

export function leerPortada(datos) {
  const token = datos.tokens[__VU % datos.tokens.length];
  const conSesion = { headers: { Authorization: `Bearer ${token}` } };

  let ids = [];
  group('portada', () => {
    const listado = http.get(`${BASE_URL}/api/noticias?orden=RECOMENDADAS`, { ...conSesion, tags: { nombre: 'listado' } });
    tiempoListado.add(listado.timings.duration);
    check(listado, {
      'listado responde 200': (r) => r.status === 200,
      'listado trae noticias': (r) => Array.isArray(r.json()) && r.json().length > 0,
    });
    if (listado.status === 200) {
      ids = listado.json().map((n) => n.id);
    }
  });

  if (ids.length > 0) {
    group('abrir noticia', () => {
      const id = ids[Math.floor(Math.random() * ids.length)];
      const noticia = http.get(`${BASE_URL}/api/noticias/${id}`, { ...conSesion, tags: { nombre: 'noticia' } });
      tiempoNoticia.add(noticia.timings.duration);
      check(noticia, { 'noticia responde 200': (r) => r.status === 200 });
    });
  }

  group('perfil y avisos', () => {
    const perfil = http.get(`${BASE_URL}/api/usuarios/me`, { ...conSesion, tags: { nombre: 'perfil' } });
    tiempoPerfil.add(perfil.timings.duration);
    check(perfil, { 'perfil responde 200': (r) => r.status === 200 });

    const avisos = http.get(`${BASE_URL}/api/notificaciones/no-leidas`, { ...conSesion, tags: { nombre: 'avisos' } });
    tiempoAvisos.add(avisos.timings.duration);
    check(avisos, { 'avisos responde 200': (r) => r.status === 200 });
  });

  // Un vecino lee un momento antes de volver a pedir.
  sleep(1);
}

export function iniciarSesion() {
  const respuesta = login(CUENTAS[__ITER % CUENTAS.length]);
  tiempoLogin.add(respuesta.timings.duration);
  check(respuesta, { 'login entrega token': (r) => r.status === 200 && Boolean(r.json('token')) });
  sleep(1);
}

/** Guarda el resumen en pruebas/carga/resultados/ además de mostrarlo en pantalla. */
export function handleSummary(datos) {
  const texto = textSummary(datos, { indent: '  ', enableColors: false });
  return {
    stdout: textSummary(datos, { indent: '  ', enableColors: true }),
    '/carga/resultados/backend-resumen.txt': texto,
    '/carga/resultados/backend-resumen.json': JSON.stringify(datos, null, 2),
  };
}
