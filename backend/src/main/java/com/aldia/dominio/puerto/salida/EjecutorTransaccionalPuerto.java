package com.aldia.dominio.puerto.salida;

import java.util.function.Supplier;

/**
 * Ejecuta un bloque como una sola transacción: o se guarda todo o nada. Así los casos
 * de uso no dependen de las anotaciones de Spring.
 */
public interface EjecutorTransaccionalPuerto {

    <T> T ejecutar(Supplier<T> bloque);
}
