import { Component, signal } from '@angular/core';
import { TEXTOS_ADMIN } from '../../core/constants/pantallas.constants';
import { Marco } from '../../shared/marco/marco';
import { GestionUsuarios } from './gestion-usuarios/gestion-usuarios';
import { ModeracionNoticias } from './moderacion-noticias/moderacion-noticias';
import { ReportesAdmin } from './reportes-admin/reportes-admin';
import { TEXTOS_REPORTES_ADMIN } from '../../core/constants/interaccion.constants';

type Pestana = 'noticias' | 'reportes' | 'usuarios';

/** Panel del administrador: moderar noticias, revisar reportes y gestionar usuarios. */
@Component({
  selector: 'app-admin',
  imports: [Marco, ModeracionNoticias, GestionUsuarios, ReportesAdmin],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  protected readonly textos = TEXTOS_ADMIN;
  protected readonly textoReportes = TEXTOS_REPORTES_ADMIN.pestana;
  protected readonly pestana = signal<Pestana>('noticias');
}
