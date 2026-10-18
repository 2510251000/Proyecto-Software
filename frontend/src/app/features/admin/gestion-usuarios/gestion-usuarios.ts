import { Component, inject, OnInit, signal } from '@angular/core';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { NIVELES_ASIGNABLES, TEXTOS_ADMIN } from '../../../core/constants/pantallas.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { CambiosUsuario, UsuarioAdmin } from '../../../core/models/admin.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

/** Gestión de cuentas: activar o desactivar y fijar el nivel. */
@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly textos = TEXTOS_ADMIN;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly niveles = NIVELES_ASIGNABLES;
  protected readonly roles = ROLES;
  /** El administrador de la sesión: no se puede desactivar a sí mismo. */
  protected readonly miId = inject(AuthService).obtenerContenidoToken()?.id ?? null;

  protected readonly usuarios = signal<UsuarioAdmin[] | null>(null);
  protected readonly ocupado = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.admin.usuarios().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  protected cambiarNivel(usuario: UsuarioAdmin, evento: Event): void {
    if (evento.target instanceof HTMLSelectElement) {
      this.actualizar(usuario, { nivel: Number(evento.target.value) });
    }
  }

  protected alternarActivo(usuario: UsuarioAdmin): void {
    this.actualizar(usuario, { activo: !usuario.activo });
  }

  private actualizar(usuario: UsuarioAdmin, cambios: CambiosUsuario): void {
    this.ocupado.set(usuario.id);
    this.error.set(null);
    this.admin.actualizarUsuario(usuario.id, cambios).subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) => (lista ?? []).map((u) => (u.id === actualizado.id ? actualizado : u)));
        this.ocupado.set(null);
      },
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.ocupado.set(null);
      },
    });
  }
}
