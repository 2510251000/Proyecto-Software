package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.NIVELES;
import static com.aldia.dominio.Fixtures.NIVEL_1;
import static com.aldia.dominio.Fixtures.NIVEL_2;
import static com.aldia.dominio.Fixtures.usuario;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.CalculadoraNivel;

@ExtendWith(MockitoExtension.class)
class ModerarNoticiaServicioTest {

    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-10-18T15:00:00Z"), ZoneId.of("America/Bogota"));
    private static final Long NOTICIA_ID = 30L;
    private static final Usuario ADMIN = usuario(1L, Usuario.Rol.ADMINISTRADOR, NIVEL_1, 0);
    private static final Usuario AUTOR = usuario(2L, Usuario.Rol.USUARIO_COMUN, NIVEL_2, 60);

    private static final EjecutorTransaccionalPuerto SIN_TRANSACCION = new EjecutorTransaccionalPuerto() {
        @Override
        public <T> T ejecutar(Supplier<T> bloque) {
            return bloque.get();
        }
    };

    @Mock
    private NoticiaRepositorioPuerto noticias;
    @Mock
    private UsuarioRepositorioPuerto usuarios;
    @Mock
    private NivelRepositorioPuerto niveles;
    @Mock
    private NotificacionRepositorioPuerto notificaciones;
    @Mock
    private HistorialRepositorioPuerto historial;

    @Captor
    private ArgumentCaptor<Usuario> guardado;
    @Captor
    private ArgumentCaptor<List<Notificacion>> avisos;

    private ModerarNoticiaServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new ModerarNoticiaServicio(noticias, usuarios, niveles, notificaciones, historial, SIN_TRANSACCION,
                new CalculadoraNivel(new ParametrosNiveles(10, 20)), RELOJ, 100);
        lenient().when(niveles.listarTodos()).thenReturn(NIVELES);
        lenient().when(usuarios.buscarPorCorreo(ADMIN.getCorreo())).thenReturn(Optional.of(ADMIN));
        lenient().when(usuarios.buscarPorId(AUTOR.getId())).thenReturn(Optional.of(AUTOR));
    }

    private static Noticia noticia(Noticia.Estado estado, boolean oficial) {
        return new Noticia(NOTICIA_ID, "Vía cerrada", "r", "c", LocalDateTime.of(2026, 10, 17, 8, 0), oficial, estado,
                "Fusagasugá", 1L, AUTOR.getId(), "Autor", 2, null, null);
    }

    @Test
    void ocultarUnaComunitariaLeRestaPuntosAlAutorYLeAvisa() {
        when(noticias.buscarPorId(NOTICIA_ID)).thenReturn(Optional.of(noticia(Noticia.Estado.PUBLICADA, false)),
                Optional.of(noticia(Noticia.Estado.OCULTA, false)));

        Noticia resultado = servicio.cambiarEstado(ADMIN.getCorreo(), NOTICIA_ID, Noticia.Estado.OCULTA);

        assertThat(resultado.getEstado()).isEqualTo(Noticia.Estado.OCULTA);
        verify(noticias).cambiarEstado(NOTICIA_ID, Noticia.Estado.OCULTA);
        verify(usuarios).guardar(guardado.capture());
        assertThat(guardado.getValue().getPuntaje()).isEqualTo(40);
        assertThat(guardado.getValue().getNivel()).isEqualTo(NIVEL_1);
        verify(notificaciones).guardarTodas(avisos.capture());
        assertThat(avisos.getValue()).singleElement().satisfies(n -> {
            assertThat(n.usuarioId()).isEqualTo(AUTOR.getId());
            assertThat(n.tipo()).isEqualTo(TipoNotificacion.MODERACION);
            assertThat(n.mensaje()).contains("fue ocultada");
        });
    }

    @Test
    void volverAPublicarleDevuelveLosPuntos() {
        when(noticias.buscarPorId(NOTICIA_ID)).thenReturn(Optional.of(noticia(Noticia.Estado.OCULTA, false)),
                Optional.of(noticia(Noticia.Estado.PUBLICADA, false)));

        servicio.cambiarEstado(ADMIN.getCorreo(), NOTICIA_ID, Noticia.Estado.PUBLICADA);

        verify(usuarios).guardar(guardado.capture());
        assertThat(guardado.getValue().getPuntaje()).isEqualTo(80);
    }

    @Test
    void unaNoticiaBorradaNoSePuedeRecuperar() {
        when(noticias.buscarPorId(NOTICIA_ID)).thenReturn(Optional.of(noticia(Noticia.Estado.ELIMINADA, false)));

        assertThatThrownBy(() -> servicio.cambiarEstado(ADMIN.getCorreo(), NOTICIA_ID, Noticia.Estado.PUBLICADA))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        verify(noticias, never()).cambiarEstado(any(), any());
    }

    @Test
    void unUsuarioComunNoPuedeModerar() {
        when(usuarios.buscarPorCorreo(AUTOR.getCorreo())).thenReturn(Optional.of(AUTOR));

        assertThatThrownBy(() -> servicio.cambiarEstado(AUTOR.getCorreo(), NOTICIA_ID, Noticia.Estado.OCULTA))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        verify(noticias, never()).cambiarEstado(any(), any());
    }

    @Test
    void moderarUnaOficialNoTocaPuntosNiAvisa() {
        when(noticias.buscarPorId(NOTICIA_ID)).thenReturn(Optional.of(noticia(Noticia.Estado.PUBLICADA, true)),
                Optional.of(noticia(Noticia.Estado.ELIMINADA, true)));

        servicio.cambiarEstado(ADMIN.getCorreo(), NOTICIA_ID, Noticia.Estado.ELIMINADA);

        verify(noticias).cambiarEstado(NOTICIA_ID, Noticia.Estado.ELIMINADA);
        verify(usuarios, never()).guardar(any());
        verify(notificaciones, never()).guardarTodas(any());
    }
}
