import { Component, signal } from '@angular/core';
import { TEXTOS_ADMIN } from '../../core/constants/pantallas.constants';
import { Encabezado } from '../../shared/encabezado/encabezado';
import { GestionUsuarios } from './gestion-usuarios/gestion-usuarios';
import { ModeracionNoticias } from './moderacion-noticias/moderacion-noticias';

type Pestana = 'noticias' | 'usuarios';

/** Panel del administrador: moderar noticias y gestionar usuarios. */
@Component({
  selector: 'app-admin',
  imports: [Encabezado, ModeracionNoticias, GestionUsuarios],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  protected readonly textos = TEXTOS_ADMIN;
  protected readonly pestana = signal<Pestana>('noticias');
}
