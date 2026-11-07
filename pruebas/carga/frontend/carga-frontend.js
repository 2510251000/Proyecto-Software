// ============================================================================
//  Al Día — prueba de carga del FRONTEND con k6
//
//  Simula muchas personas abriendo la aplicación al mismo tiempo: cada una
//  descarga la página (index.html), los archivos de Angular que esa página
//  pide (JavaScript y CSS), una foto de noticia y una ruta interna (nginx debe
//  devolver index.html para que Angular la resuelva).
//
//  Es la versión compilada que sirve nginx en el contenedor «frontend» de
//  docker-compose.yml, no el servidor de desarrollo (ng serve).
//
//  Se corre con pruebas/carga/correr-carga.ps1 -Parte frontend
//
//  Variables (todas opcionales):
//    BASE_URL     dirección del frontend    (por defecto http://host.docker.internal:4200)
//    USUARIOS     personas simultáneas      (por defecto 100)
//    DURACION     tiempo con la carga llena (por defecto 1m)
// ============================================================================
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:4200';
const USUARIOS = Number(__ENV.USUARIOS || 100);
const DURACION = __ENV.DURACION || '1m';

// Como cualquier navegador, se pide el contenido comprimido (k6 no lo pide si no se le dice).
const NAVEGADOR = { 'Accept-Encoding': 'gzip, deflate, br' };

const tiempoPagina = new Trend('tiempo_pagina', true);
const tiempoArchivos = new Trend('tiempo_archivos', true);
const tiempoRutaInterna = new Trend('tiempo_ruta_interna', true);

export const options = {
  scenarios: {
    abrir_app: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: USUARIOS },
        { duration: DURACION, target: USUARIOS },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    // Archivos estáticos: el 95 % en menos de 300 ms.
    tiempo_pagina: ['p(95)<300'],
    tiempo_archivos: ['p(95)<300'],
    tiempo_ruta_interna: ['p(95)<300'],
  },
};

/** Saca de index.html los archivos que Angular necesita: <script src> y <link rel="stylesheet" href>. */
function archivosDe(html) {
  const rutas = new Set();
  for (const coincidencia of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    rutas.add(coincidencia[1]);
  }
  for (const coincidencia of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
    rutas.add(coincidencia[1]);
  }
  return [...rutas].filter((ruta) => !ruta.startsWith('http'));
}

/** Antes de la carga: comprueba que el frontend responde y anota sus archivos. */
export function setup() {
  const pagina = http.get(`${BASE_URL}/`);
  if (pagina.status !== 200) {
    throw new Error(`El frontend no responde en ${BASE_URL} (estado ${pagina.status}). ¿Está corriendo «docker compose up»?`);
  }
  const archivos = archivosDe(pagina.body);
  if (archivos.length === 0) {
    throw new Error('index.html no trae archivos de Angular: ¿es la versión compilada?');
  }
  return { archivos };
}

export default function (datos) {
  group('abrir la página', () => {
    const pagina = http.get(`${BASE_URL}/`, { headers: NAVEGADOR, tags: { nombre: 'index' } });
    tiempoPagina.add(pagina.timings.duration);
    check(pagina, {
      'index responde 200': (r) => r.status === 200,
      'index trae <app-root>': (r) => r.body.includes('<app-root'),
    });
  });

  group('archivos de Angular', () => {
    const peticiones = datos.archivos.map((ruta) => ['GET', `${BASE_URL}/${ruta.replace(/^\//, '')}`, null, { headers: NAVEGADOR, tags: { nombre: 'archivo' } }]);
    peticiones.push(['GET', `${BASE_URL}/imagenes/noticias/bici.webp`, null, { headers: NAVEGADOR, tags: { nombre: 'foto' } }]);
    // El navegador las pide en paralelo; k6 también.
    for (const respuesta of http.batch(peticiones)) {
      tiempoArchivos.add(respuesta.timings.duration);
      check(respuesta, { 'archivo responde 200': (r) => r.status === 200 });
    }
  });

  group('ruta interna', () => {
    const ruta = http.get(`${BASE_URL}/noticias`, { headers: NAVEGADOR, tags: { nombre: 'ruta-interna' } });
    tiempoRutaInterna.add(ruta.timings.duration);
    check(ruta, { 'ruta interna devuelve la app': (r) => r.status === 200 && r.body.includes('<app-root') });
  });

  // Una persona mira la pantalla un momento antes de volver a cargar.
  sleep(1);
}

export function handleSummary(datos) {
  const texto = textSummary(datos, { indent: '  ', enableColors: false });
  return {
    stdout: textSummary(datos, { indent: '  ', enableColors: true }),
    '/carga/resultados/frontend-resumen.txt': texto,
    '/carga/resultados/frontend-resumen.json': JSON.stringify(datos, null, 2),
  };
}
