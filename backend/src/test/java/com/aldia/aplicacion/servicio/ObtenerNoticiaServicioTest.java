package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class ObtenerNoticiaServicioTest {

    @Mock
    private NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    @InjectMocks
    private ObtenerNoticiaServicio servicio;

    @Test
    void devuelveLaNoticiaPublicada() {
        Noticia noticia = new Noticia(7L, "Título", "Resumen", "Contenido", LocalDateTime.now(),
                false, Noticia.Estado.PUBLICADA, "Fusagasugá");
        when(noticiaRepositorioPuerto.buscarPublicadaPorId(7L)).thenReturn(Optional.of(noticia));

        assertThat(servicio.obtenerPublicada(7L)).isSameAs(noticia);
    }

    @Test
    void respondeNoEncontradaSiNoExisteOEstaOculta() {
        when(noticiaRepositorioPuerto.buscarPublicadaPorId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.obtenerPublicada(99L))
                .isInstanceOf(NoticiaNoEncontradaExcepcion.class);
    }
}
