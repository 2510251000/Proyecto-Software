package com.aldia.dominio.servicio;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.ParametrosRecomendacion;

/**
 * Orden de "recomendadas": la fecha manda, pero cada nivel del autor por encima del 1
 * y el ser oficial adelantan la noticia unas horas (configurables). Así una noticia de
 * un corresponsal de nivel 3 aparece antes que una igual de reciente de un nivel 1.
 */
public class PoliticaRecomendacion {

    private final ParametrosRecomendacion parametros;

    public PoliticaRecomendacion(ParametrosRecomendacion parametros) {
        this.parametros = parametros;
    }

    public List<Noticia> ordenar(List<Noticia> noticias) {
        return noticias.stream()
                .sorted(Comparator.comparing(this::fechaEfectiva).reversed()
                        .thenComparing(Noticia::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    /** La fecha de publicación adelantada por las horas de ventaja de la noticia. */
    public LocalDateTime fechaEfectiva(Noticia noticia) {
        int nivelesExtra = Math.max(0, noticia.getAutorNivel() - 1);
        long horas = (long) nivelesExtra * parametros.horasVentajaPorNivel()
                + (noticia.isOficial() ? parametros.horasVentajaOficial() : 0);
        return noticia.getFechaPublicacion().plusHours(horas);
    }
}
