package com.aldia.dominio.servicio;

import static com.aldia.dominio.Fixtures.noticia;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.ParametrosRecomendacion;

class PoliticaRecomendacionTest {

    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 10, 18, 12, 0);

    // 12 horas de ventaja por nivel extra y 6 por ser oficial.
    private final PoliticaRecomendacion politica = new PoliticaRecomendacion(new ParametrosRecomendacion(12, 6));

    @Test
    void unaNoticiaDeNivel3SubePorEncimaDeUnaMasRecienteDeNivel1() {
        Noticia nivel1Reciente = noticia(1L, AHORA, false, 1, 10L);
        Noticia nivel3DeAyer = noticia(2L, AHORA.minusHours(20), false, 3, 20L);

        assertThat(politica.ordenar(List.of(nivel1Reciente, nivel3DeAyer)))
                .extracting(Noticia::getId)
                .containsExactly(2L, 1L);
    }

    @Test
    void laVentajaTieneLimite() {
        Noticia nivel1Reciente = noticia(1L, AHORA, false, 1, 10L);
        Noticia nivel3MuyVieja = noticia(2L, AHORA.minusDays(3), false, 3, 20L);

        assertThat(politica.ordenar(List.of(nivel3MuyVieja, nivel1Reciente)))
                .extracting(Noticia::getId)
                .containsExactly(1L, 2L);
    }

    @Test
    void lasOficialesTambienSuben() {
        Noticia comunitaria = noticia(1L, AHORA, false, 1, 10L);
        Noticia oficial = noticia(2L, AHORA.minusHours(5), true, 1, 99L);

        assertThat(politica.ordenar(List.of(comunitaria, oficial)))
                .extracting(Noticia::getId)
                .containsExactly(2L, 1L);
    }

    @Test
    void sinVentajaSeConservaElOrdenPorFecha() {
        Noticia vieja = noticia(1L, AHORA.minusHours(2), false, 1, 10L);
        Noticia nueva = noticia(2L, AHORA, false, 1, 11L);

        assertThat(politica.ordenar(List.of(vieja, nueva)))
                .extracting(Noticia::getId)
                .containsExactly(2L, 1L);
        assertThat(politica.fechaEfectiva(nueva)).isEqualTo(AHORA);
    }
}
