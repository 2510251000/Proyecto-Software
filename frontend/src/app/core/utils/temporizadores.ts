import { DestroyRef } from '@angular/core';

/**
 * Agrupa los setTimeout de un componente para cancelarlos todos juntos.
 * Al crearlo con el DestroyRef del componente, se limpian solos cuando el componente se destruye.
 */
export class Temporizadores {
  private readonly pendientes = new Set<ReturnType<typeof setTimeout>>();

  constructor(destruccion: DestroyRef) {
    destruccion.onDestroy(() => this.cancelarTodos());
  }

  programar(accion: () => void, ms: number): ReturnType<typeof setTimeout> {
    const id = setTimeout(() => {
      this.pendientes.delete(id);
      accion();
    }, ms);
    this.pendientes.add(id);
    return id;
  }

  cancelar(id: ReturnType<typeof setTimeout> | null): void {
    if (id !== null) {
      clearTimeout(id);
      this.pendientes.delete(id);
    }
  }

  cancelarTodos(): void {
    this.pendientes.forEach((id) => clearTimeout(id));
    this.pendientes.clear();
  }
}
