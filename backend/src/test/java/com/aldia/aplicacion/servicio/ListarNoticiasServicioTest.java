package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class ListarNoticiasServicioTest {

    @Mock
    private NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    @InjectMocks
    private ListarNoticiasServicio servicio;

    @Test
    void devuelveLasNoticiasPublicadasDelRepositorio() {
        Noticia noticia = new Noticia(1L, "Título", "Resumen", "Contenido",
                LocalDateTime.now(), false, Noticia.Estado.PUBLICADA, "Fusagasugá");
        when(noticiaRepositorioPuerto.buscarPublicadasOrdenadasPorFecha()).thenReturn(List.of(noticia));

        assertThat(servicio.listarPublicadas()).containsExactly(noticia);
    }

    @Test
    void devuelveListaVaciaSiNoHayNoticias() {
        when(noticiaRepositorioPuerto.buscarPublicadasOrdenadasPorFecha()).thenReturn(List.of());

        assertThat(servicio.listarPublicadas()).isEmpty();
    }
}
