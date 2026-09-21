import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { Campo } from './campo';

describe('Campo', () => {
  let fixture: ComponentFixture<Campo>;
  let control: FormControl<string>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const entrada = () => raiz().querySelector('input') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Campo] }).compileComponents();
    control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    fixture = TestBed.createComponent(Campo);
    fixture.componentRef.setInput('idCampo', 'campo-correo');
    fixture.componentRef.setInput('etiqueta', 'Correo');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('errores', { required: 'El correo es obligatorio.' });
    await fixture.whenStable();
  });

  it('liga la etiqueta con el campo', () => {
    const etiqueta = raiz().querySelector('label') as HTMLLabelElement;
    expect(etiqueta.textContent).toContain('Correo');
    expect(etiqueta.htmlFor).toBe('campo-correo');
    expect(entrada().id).toBe('campo-correo');
  });

  it('no muestra error mientras el usuario no ha tocado el campo', () => {
    expect(raiz().querySelector('.mensaje-error')).toBeNull();
    expect(entrada().hasAttribute('aria-describedby')).toBe(false);
  });

  it('muestra el error ligado al campo con aria-describedby una vez tocado', () => {
    control.markAsTouched();
    fixture.detectChanges();
    const mensaje = raiz().querySelector('.mensaje-error') as HTMLElement;
    expect(mensaje.textContent).toContain('El correo es obligatorio.');
    expect(entrada().getAttribute('aria-describedby')).toBe(mensaje.id);
    expect(entrada().getAttribute('aria-invalid')).toBe('true');
  });

  it('quita el error cuando el valor es válido', () => {
    control.markAsTouched();
    control.setValue('a@b.co');
    fixture.detectChanges();
    expect(raiz().querySelector('.mensaje-error')).toBeNull();
    expect(entrada().hasAttribute('aria-describedby')).toBe(false);
  });
});
