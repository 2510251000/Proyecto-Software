import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TIEMPOS_ENTRADA } from '../../../core/constants/animaciones.constants';
import {
  AVISOS_POR_MOTIVO,
  ERRORES_CONTRASENA,
  ERRORES_CORREO,
  TEXTOS_AUTH,
  TEXTOS_ENTRADA,
} from '../../../core/constants/mensajes.constants';
import { PARAMETROS_URL } from '../../../core/constants/navegacion.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { LONGITUD_MINIMA_CONTRASENA } from '../../../core/constants/validacion.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AuthService } from '../../../core/services/auth.service';
import { EntradaService } from '../../../core/services/entrada.service';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { Temporizadores } from '../../../core/utils/temporizadores';
import { Boton } from '../../../shared/boton/boton';
import { Campo } from '../../../shared/campo/campo';
import { EscenaAtardecer } from '../escena-atardecer/escena-atardecer';

/**
 * Momento de la pantalla:
 * - `entrada`: el sol sale y se oculta (una vez por sesión del navegador).
 * - `formulario`: cielo de noche con la tarjeta del login.
 * - `amanecer`: el login respondió bien; amanece y luego se va a «Hoy».
 */
export type FaseLogin = 'entrada' | 'formulario' | 'amanecer';

/** Estrellas de la noche: posición en % de la pantalla, tamaño en px y retraso del titileo en s. */
const ESTRELLAS: readonly { x: number; y: number; tamano: number; retraso: number }[] = [
  { x: 8, y: 12, tamano: 2, retraso: 0 },
  { x: 18, y: 30, tamano: 3, retraso: 0.6 },
  { x: 27, y: 8, tamano: 2, retraso: 1.2 },
  { x: 36, y: 22, tamano: 2, retraso: 0.3 },
  { x: 47, y: 6, tamano: 3, retraso: 1.8 },
  { x: 58, y: 18, tamano: 2, retraso: 0.9 },
  { x: 66, y: 9, tamano: 2, retraso: 2.1 },
  { x: 74, y: 27, tamano: 3, retraso: 0.4 },
  { x: 83, y: 14, tamano: 2, retraso: 1.5 },
  { x: 92, y: 33, tamano: 2, retraso: 0.7 },
  { x: 12, y: 52, tamano: 2, retraso: 1.1 },
  { x: 88, y: 58, tamano: 3, retraso: 2.4 },
  { x: 5, y: 78, tamano: 2, retraso: 0.2 },
  { x: 95, y: 82, tamano: 2, retraso: 1.7 },
];

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Campo, Boton, EscenaAtardecer],
  templateUrl: './login.html',
  styleUrls: ['../auth.css', './login.css'],
  host: {
    '[style.--duracion-entrada.ms]': 'tiempos.total',
    '[style.--inicio-tarjeta.ms]': 'tiempos.tarjeta',
    '[style.--duracion-amanecer.ms]': 'tiempos.amanecer',
  },
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly entrada = inject(EntradaService);
  private readonly movimiento = inject(MovimientoService);
  private readonly temporizadores = new Temporizadores(inject(DestroyRef));

  protected readonly formulario = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(LONGITUD_MINIMA_CONTRASENA)]],
  });

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso =
    AVISOS_POR_MOTIVO.get(
      inject(ActivatedRoute).snapshot.queryParamMap.get(PARAMETROS_URL.motivo) ?? '',
    ) ?? null;

  protected readonly fase = signal<FaseLogin>('formulario');
  /** Mientras la tarjeta no aparece, el formulario no recibe foco ni clics (inert). */
  protected readonly tarjetaLista = signal(true);

  protected readonly textos = TEXTOS_AUTH;
  protected readonly textosEntrada = TEXTOS_ENTRADA;
  protected readonly rutas = RUTAS;
  protected readonly erroresCorreo = ERRORES_CORREO;
  protected readonly erroresContrasena = ERRORES_CONTRASENA;
  protected readonly tiempos = TIEMPOS_ENTRADA;
  protected readonly estrellas = ESTRELLAS;

  ngOnInit(): void {
    if (this.movimiento.reducirMovimiento() || this.entrada.yaSeVio()) {
      return;
    }
    this.entrada.marcarVista();
    this.fase.set('entrada');
    this.tarjetaLista.set(false);
    this.temporizadores.programar(() => this.tarjetaLista.set(true), TIEMPOS_ENTRADA.tarjeta);
    this.temporizadores.programar(() => this.terminarEntrada(), TIEMPOS_ENTRADA.total);
  }

  /** Botón «Saltar»: se ve de una vez el estado final (cielo de noche y formulario). */
  protected saltar(): void {
    this.temporizadores.cancelarTodos();
    this.terminarEntrada();
  }

  protected enviar(): void {
    if (this.cargando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.auth.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: () => this.amanecer(),
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.cargando.set(false);
      },
    });
  }

  private terminarEntrada(): void {
    this.tarjetaLista.set(true);
    if (this.fase() === 'entrada') {
      this.fase.set('formulario');
    }
  }

  /** Amanece en la misma pantalla y después abre «Hoy». Sin animaciones, entra de una vez. */
  private amanecer(): void {
    // Si la navegación no se da (por ejemplo, un guard la redirige), el formulario vuelve a usarse.
    const irAHoy = () =>
      void this.router.navigate([RUTAS.hoy]).then((navego) => {
        if (!navego) {
          this.fase.set('formulario');
          this.cargando.set(false);
        }
      });
    if (this.movimiento.reducirMovimiento()) {
      irAHoy();
      return;
    }
    this.temporizadores.cancelarTodos();
    this.fase.set('amanecer');
    this.temporizadores.programar(irAHoy, TIEMPOS_ENTRADA.amanecer);
  }
}
