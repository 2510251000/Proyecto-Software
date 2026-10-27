package com.aldia.dominio.servicio;

import static com.aldia.dominio.Fixtures.noticia;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoNotificacion;

class AvisosPorCiudadTest {

    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 10, 18, 9, 30);
    private static final Long AUTOR = 5L;

    private final AvisosPorCiudad avisos = new AvisosPorCiudad();

    @Test
    void avisaATodosLosVecinosMenosAlAutor() {
        Noticia noticia = noticia(40L, AHORA, false, 1, AUTOR);

        List<Notificacion> creadas = avisos.paraNoticiaNueva(noticia, List.of(1L, AUTOR, 2L, 3L), AHORA);

        assertThat(creadas).extracting(Notificacion::usuarioId).containsExactly(1L, 2L, 3L);
        assertThat(creadas).allSatisfy(n -> {
            assertThat(n.tipo()).isEqualTo(TipoNotificacion.CERCANIA);
            assertThat(n.noticiaId()).isEqualTo(40L);
            assertThat(n.leida()).isFalse();
            assertThat(n.fecha()).isEqualTo(AHORA);
            assertThat(n.mensaje()).isEqualTo("Nueva noticia en Fusagasugá: Noticia 40");
        });
    }

    @Test
    void sinVecinosNoHayAvisos() {
        assertThat(avisos.paraNoticiaNueva(noticia(1L, AHORA, false, 1, AUTOR), List.of(AUTOR), AHORA)).isEmpty();
        assertThat(avisos.paraNoticiaNueva(noticia(1L, AHORA, false, 1, AUTOR), List.of(), AHORA)).isEmpty();
    }

    @Test
    void noRepiteNiAceptaIdsVacios() {
        List<Notificacion> creadas = avisos.paraNoticiaNueva(noticia(1L, AHORA, true, 1, AUTOR),
                Arrays.asList(7L, null, 7L), AHORA);

        assertThat(creadas).extracting(Notificacion::usuarioId).containsExactly(7L);
    }

    @Test
    void elMensajeNoPasaDelLargoDeLaColumna() {
        String largo = "x".repeat(400);

        assertThat(AvisosPorCiudad.recortar(largo)).hasSize(AvisosPorCiudad.LARGO_MAXIMO_MENSAJE).endsWith("…");
    }
}
