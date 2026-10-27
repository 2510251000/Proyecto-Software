import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ERRORES_NOMBRE, TEXTOS_AUTH, TEXTOS_COMUNES } from '../../core/constants/mensajes.constants';
import { TEXTOS_PERFIL } from '../../core/constants/pantallas.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { LONGITUD_MAXIMA_NOMBRE } from '../../core/constants/validacion.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { Perfil as DatosPerfil } from '../../core/models/perfil.model';
import { Ciudad } from '../../core/models/ubicacion.model';
import { PerfilService } from '../../core/services/perfil.service';
import { Boton } from '../../shared/boton/boton';
import { Campo } from '../../shared/campo/campo';
import { Encabezado } from '../../shared/encabezado/encabezado';
import { SelectorCiudad } from '../../shared/selector-ciudad/selector-ciudad';

/** Perfil: nivel, puntos para el siguiente, cupo de hoy y datos editables (nombre y municipio). */
@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Encabezado, Campo, Boton, SelectorCiudad],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly servicio = inject(PerfilService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly textos = TEXTOS_PERFIL;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly etiquetaNombre = TEXTOS_AUTH.nombre;
  protected readonly erroresNombre = ERRORES_NOMBRE;
  protected readonly longitudNombre = LONGITUD_MAXIMA_NOMBRE;

  protected readonly datos = signal<DatosPerfil | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly guardado = signal(false);
  protected readonly guardando = signal(false);

  protected readonly formulario = this.fb.group({
    nombre: ['', [Validators.maxLength(LONGITUD_MAXIMA_NOMBRE)]],
    ciudadId: this.fb.control<number | null>(null),
  });

  protected readonly esAdministrador = computed(() => this.datos()?.rol === ROLES.administrador);

  /** Avance hacia el siguiente nivel, de 0 a 100. */
  protected readonly progreso = computed(() => {
    const datos = this.datos();
    if (datos === null || datos.siguienteNivel === null) {
      return 100;
    }
    return Math.min(100, Math.round((datos.puntaje / datos.siguienteNivel.puntajeMinimo) * 100));
  });

  protected readonly faltan = computed(() => {
    const datos = this.datos();
    return datos?.siguienteNivel ? Math.max(0, datos.siguienteNivel.puntajeMinimo - datos.puntaje) : 0;
  });

  ngOnInit(): void {
    this.servicio.obtener().subscribe({
      next: (datos) => this.mostrar(datos),
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  protected elegirCiudad(ciudad: Ciudad): void {
    this.formulario.controls.ciudadId.setValue(ciudad.id);
    this.guardado.set(false);
  }

  protected guardar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { nombre, ciudadId } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.error.set(null);
    this.servicio
      .actualizar({ nombre: nombre.trim(), ...(ciudadId !== null ? { ciudadId } : {}) })
      .subscribe({
        next: (datos) => {
          this.mostrar(datos);
          this.guardado.set(true);
          this.guardando.set(false);
        },
        error: (error: ErrorApi) => {
          this.error.set(error.mensaje);
          this.guardando.set(false);
        },
      });
  }

  private mostrar(datos: DatosPerfil): void {
    this.datos.set(datos);
    this.formulario.setValue({ nombre: datos.nombre ?? '', ciudadId: datos.ciudad?.id ?? null });
  }
}
