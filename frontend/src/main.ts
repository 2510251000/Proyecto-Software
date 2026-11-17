import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { destinoEnDominioDeInicio } from './app/core/services/proveedor-google';
import { environment } from './environments/environment';

// En producción la app se usa desde el dominio del inicio con Google (ver destinoEnDominioDeInicio).
const destino = environment.firebase ? destinoEnDominioDeInicio(environment.firebase, globalThis.location) : null;
if (destino) {
  globalThis.location.replace(destino);
} else {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
}
