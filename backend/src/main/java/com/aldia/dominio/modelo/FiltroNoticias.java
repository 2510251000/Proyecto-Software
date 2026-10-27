package com.aldia.dominio.modelo;

/**
 * Criterios del listado público de noticias. Todos son opcionales.
 *
 * @param tipo     oficiales, comunitarias o todas
 * @param ciudadId solo las de esa ciudad (null = todas)
 * @param texto    busca en el título, el resumen y el contenido (null o vacío = sin búsqueda)
 * @param orden    recientes primero o recomendadas primero
 */
public record FiltroNoticias(Tipo tipo, Long ciudadId, String texto, Orden orden) {

    public FiltroNoticias {
        tipo = tipo == null ? Tipo.TODAS : tipo;
        orden = orden == null ? Orden.RECIENTES : orden;
        texto = texto == null || texto.isBlank() ? null : texto.trim();
    }

    public static FiltroNoticias todas() {
        return new FiltroNoticias(Tipo.TODAS, null, null, Orden.RECIENTES);
    }

    public enum Tipo {
        TODAS,
        OFICIALES,
        COMUNITARIAS
    }

    public enum Orden {
        RECIENTES,
        /** Las de autores de nivel alto y las oficiales suben (ver PoliticaRecomendacion). */
        RECOMENDADAS
    }
}
