import { Component } from '@angular/core';
import { Logo } from '../logo/logo';
import { Navegacion } from '../navegacion/navegacion';

@Component({
  selector: 'app-encabezado',
  imports: [Logo, Navegacion],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css',
})
export class Encabezado {}
