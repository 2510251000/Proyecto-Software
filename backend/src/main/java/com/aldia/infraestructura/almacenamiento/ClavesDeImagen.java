package com.aldia.infraestructura.almacenamiento;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Las claves de los archivos de fotos: «uuid.extensión». El nombre que puso el usuario nunca
 * se usa, así no hay rutas raras ni archivos que se pisen. Las comparten todos los almacenes.
 */
final class ClavesDeImagen {

    /** Solo claves que generó el portal. Impide salir de la carpeta o leer otros objetos. */
    private static final Pattern CLAVE_VALIDA = Pattern.compile("^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.(jpg|png|webp)$");

    private ClavesDeImagen() {
    }

    /** Una clave nueva para un archivo con esa extensión (jpg, png o webp). */
    static String nueva(String extension) {
        String clave = UUID.randomUUID() + "." + extension;
        if (!esValida(clave)) {
            throw new IllegalArgumentException("Extensión no permitida: " + extension);
        }
        return clave;
    }

    static boolean esValida(String clave) {
        return clave != null && CLAVE_VALIDA.matcher(clave).matches();
    }
}
