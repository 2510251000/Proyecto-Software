import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TEXTOS_COMUNES } from '../../core/constants/mensajes.constants';
import {
  MENSAJES_PUBLICAR,
  TEXTOS_PUBLICAR,
  textoCupo,
} from '../../core/constants/pantallas.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import {
  LONGITUD_MAXIMA_RESUMEN,
  LONGITUD_MAXIMA_TITULO,
} from '../../core/constants/validacion.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { NuevaNoticia } from '../../core/models/noticia.model';
import { Perfil } from '../../core/models/perfil.model';
import { Ciudad } from '../../core/models/ubicacion.model';
import { NoticiaService } from '../../core/services/noticia.service';
import { PerfilService } from '../../core/services/perfil.service';
import { Boton } from '../../shared/boton/boton';
import { Campo } from '../../shared/campo/campo';
import { Encabezado } from '../../shared/encabezado/encabezado';
import { SelectorCiudad } from '../../shared/selector-ciudad/selector-ciudad';
import { AlmacenNoticias } from '../noticias/almacen-noticias';

/**
 * Publicar una noticia. Arriba dice cuántas publicaciones le quedan hoy al usuario según
 * su nivel; el backend vuelve a verificar el límite al publicar.
 */
@Component({
  selector: 'app-publicar',
  imports: [ReactiveFormsModule, Encabezado, Campo, Boton, SelectorCiudad],
  templateUrl: './publicar.html',
})
export class Publicar implements OnInit {
  private readonly perfiles = inject(PerfilService);
  private readonly noticias = inject(NoticiaService);
  private readonly almacen = inject(AlmacenNoticias);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly textos = TEXTOS_PUBLICAR;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly maximoTitulo = LONGITUD_MAXIMA_TITULO;
  protected readonly maximoResumen = LONGITUD_MAXIMA_RESUMEN;
  protected readonly erroresTitulo = {
    required: MENSAJES_PUBLICAR.tituloObligatorio,
    maxlength: MENSAJES_PUBLICAR.tituloLargo,
  };
  protected readonly erroresResumen = { maxlength: MENSAJES_PUBLICAR.resumenLargo };
  protected readonly erroresContenido = { required: MENSAJES_PUBLICAR.contenidoObligatorio };

  protected readonly formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(LONGITUD_MAXIMA_TITULO)]],
    resumen: ['', [Validators.maxLength(LONGITUD_MAXIMA_RESUMEN)]],
    contenido: ['', [Validators.required]],
    ciudadId: this.fb.control<number | null>(null, Validators.required),
  });

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly ciudad = signal<Ciudad | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly esAdministrador = computed(() => this.perfil()?.rol === ROLES.administrador);
  protected readonly sinCupo = computed(() => {
    const cupo = this.perfil()?.cupo;
    return cupo !== undefined && !cupo.ilimitado && cupo.restantes === 0;
  });
  protected readonly avisoCupo = computed(() => {
    const cupo = this.perfil()?.cupo;
    if (cupo === undefined) {
      return null;
    }
    if (cupo.ilimitado) {
      return TEXTOS_PUBLICAR.cupoIlimitado;
    }
    return cupo.restantes === 0
      ? TEXTOS_PUBLICAR.cupoAgotado
      : textoCupo(cupo.restantes ?? 0, cupo.limite);
  });

  ngOnInit(): void {
    this.perfiles.obtener().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        if (perfil.ciudad !== null) {
          this.elegirCiudad(perfil.ciudad);
        }
      },
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  protected elegirCiudad(ciudad: Ciudad): void {
    this.ciudad.set(ciudad);
    this.formulario.controls.ciudadId.setValue(ciudad.id);
  }

  protected enviar(): void {
    if (this.cargando() || this.sinCupo()) {
      return;
    }
    const { titulo, resumen, contenido, ciudadId } = this.formulario.getRawValue();
    if (this.formulario.invalid || ciudadId === null) {
      this.formulario.markAllAsTouched();
      return;
    }

    const ciudad = this.ciudad();
    const datos: NuevaNoticia = {
      titulo: titulo.trim(),
      resumen: resumen.trim(),
      contenido: contenido.trim(),
      ciudadId,
      // El punto de la ciudad que entregó la API de mapas, si lo hay.
      ...(ciudad !== null && ciudad.latitud !== null && ciudad.longitud !== null
        ? { latitud: ciudad.latitud, longitud: ciudad.longitud }
        : {}),
    };

    this.cargando.set(true);
    this.error.set(null);
    this.noticias.publicar(datos).subscribe({
      next: (publicada) => {
        this.almacen.cargar();
        void this.router.navigate(['/', RUTAS.noticias, publicada.id]);
      },
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.cargando.set(false);
      },
    });
  }
}
