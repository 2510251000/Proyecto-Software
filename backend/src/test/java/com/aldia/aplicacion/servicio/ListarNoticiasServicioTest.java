package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.noticia;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.ParametrosRecomendacion;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.servicio.PoliticaRecomendacion;

@ExtendWith(MockitoExtension.class)
class ListarNoticiasServicioTest {

    private static final int MAXIMO = 200;
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 10, 18, 12, 0);

    @Mock
    private NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    private ListarNoticiasServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new ListarNoticiasServicio(noticiaRepositorioPuerto,
                new PoliticaRecomendacion(new ParametrosRecomendacion(12, 6)), MAXIMO);
    }

    @Test
    void devuelveLasNoticiasDelRepositorioEnElOrdenRecibido() {
        FiltroNoticias filtro = FiltroNoticias.todas();
        Noticia noticia = noticia(1L, AHORA, false, 1, 3L);
        when(noticiaRepositorioPuerto.buscarPublicadas(filtro, MAXIMO)).thenReturn(List.of(noticia));

        assertThat(servicio.listarPublicadas(filtro)).containsExactly(noticia);
    }

    @Test
    void pasaLosFiltrosAlRepositorio() {
        FiltroNoticias filtro = new FiltroNoticias(FiltroNoticias.Tipo.OFICIALES, 4L, "  agua ", null);
        when(noticiaRepositorioPuerto.buscarPublicadas(filtro, MAXIMO)).thenReturn(List.of());

        assertThat(servicio.listarPublicadas(filtro)).isEmpty();
        verify(noticiaRepositorioPuerto).buscarPublicadas(new FiltroNoticias(FiltroNoticias.Tipo.OFICIALES, 4L, "agua",
                FiltroNoticias.Orden.RECIENTES), MAXIMO);
    }

    @Test
    void enRecomendadasSubenLasDeAutoresDeNivelAlto() {
        FiltroNoticias filtro = new FiltroNoticias(null, null, null, FiltroNoticias.Orden.RECOMENDADAS);
        Noticia reciente = noticia(1L, AHORA, false, 1, 3L);
        Noticia deCorresponsal = noticia(2L, AHORA.minusHours(10), false, 3, 4L);
        when(noticiaRepositorioPuerto.buscarPublicadas(filtro, MAXIMO)).thenReturn(List.of(reciente, deCorresponsal));

        assertThat(servicio.listarPublicadas(filtro)).extracting(Noticia::getId).containsExactly(2L, 1L);
    }
}
