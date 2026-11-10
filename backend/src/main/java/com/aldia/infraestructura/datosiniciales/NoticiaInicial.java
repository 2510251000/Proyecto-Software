package com.aldia.infraestructura.datosiniciales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Una noticia real que trae la aplicación desde el inicio (datos-iniciales/noticias/noticias.json).
 * El contenido termina citando el medio y el enlace a la nota original; «fuente» es ese enlace.
 * «autor» es el correo de quien la publica: si esa cuenta no existe, la publica un administrador.
 */
public record NoticiaInicial(
        String titulo,
        String resumen,
        String contenido,
        LocalDateTime fechaPublicacion,
        boolean oficial,
        String ciudad,
        String autor,
        BigDecimal latitud,
        BigDecimal longitud,
        String foto,
        String textoAlternativo,
        String fuente
) {
}
