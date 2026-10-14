// DOCKER: la aplicación compilada como en producción, para docker-compose.yml.
// El navegador corre en la máquina del usuario, así que llega al backend por el puerto
// que el contenedor publica en localhost, no por el nombre del servicio.
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080',
};
