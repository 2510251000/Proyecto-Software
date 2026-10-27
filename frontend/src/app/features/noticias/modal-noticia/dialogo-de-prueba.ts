/**
 * Solo para las pruebas: jsdom no trae showModal() ni close() del <dialog>, así que aquí
 * se imita lo mínimo (abrir, cerrar y avisar con el evento close). La trampa de foco, el
 * Escape y la devolución del foco son del navegador y se revisan en un navegador de verdad.
 */
export function simularDialogoNativo(): void {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
