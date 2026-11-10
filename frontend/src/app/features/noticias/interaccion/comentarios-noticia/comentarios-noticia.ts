import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LARGO_MAXIMO_COMENTARIO, TEXTOS_COMENTARIOS } from '../../../../core/constants/interaccion.constants';
import { ROLES } from '../../../../core/constants/roles.constants';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Comentario } from '../../../../core/models/interaccion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { InteraccionService } from '../../../../core/services/interaccion.service';
import { tiempoRelativo } from '../../../../core/utils/noticia';
import { Boton } from '../../../../shared/boton/boton';
import { Campo } from '../../../../shared/campo/campo';

/** Comentarios de la noticia y el formulario para comentar (HU MF03_001). */
@Component({
  selector: 'app-comentarios-noticia',
  imports: [ReactiveFormsModule, Campo, Boton],
  templateUrl: './comentarios-noticia.html',
  styleUrl: './comentarios-noticia.css',
})
export class ComentariosNoticia implements OnInit {
  private readonly interaccion = inject(InteraccionService);
  private readonly sesion = inject(AuthService).obtenerContenidoToken();

  readonly noticiaId = input.required<number>();

  protected readonly textos = TEXTOS_COMENTARIOS;
  protected readonly largoMaximo = LARGO_MAXIMO_COMENTARIO;
  protected readonly errores = { required: TEXTOS_COMENTARIOS.obligatorio, maxlength: TEXTOS_COMENTARIOS.largo };
  protected readonly control = inject(NonNullableFormBuilder).control('', [
    Validators.required,
    Validators.maxLength(LARGO_MAXIMO_COMENTARIO),
  ]);

  readonly comentarios = signal<Comentario[] | null>(null);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.interaccion.comentarios(this.noticiaId()).subscribe({
      next: (lista) => this.comentarios.set(lista),
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  protected cuando(fecha: string): string {
    return tiempoRelativo(fecha);
  }

  protected puedeBorrar(comentario: Comentario): boolean {
    return this.sesion !== null && (this.sesion.rol === ROLES.administrador || this.sesion.id === comentario.autorId);
  }

  protected enviar(): void {
    const contenido = this.control.value.trim();
    if (this.enviando()) {
      return;
    }
    if (this.control.invalid || contenido === '') {
      this.control.setValue(contenido);
      this.control.markAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.interaccion.comentar(this.noticiaId(), contenido).subscribe({
      next: (nuevo) => {
        this.comentarios.update((lista) => [...(lista ?? []), nuevo]);
        this.control.reset();
        this.enviando.set(false);
      },
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.enviando.set(false);
      },
    });
  }

  protected borrar(comentario: Comentario): void {
    if (!confirm(this.textos.confirmarBorrado)) {
      return;
    }
    this.interaccion.borrarComentario(this.noticiaId(), comentario.id).subscribe({
      next: () => this.comentarios.update((lista) => (lista ?? []).filter((c) => c.id !== comentario.id)),
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }
}
