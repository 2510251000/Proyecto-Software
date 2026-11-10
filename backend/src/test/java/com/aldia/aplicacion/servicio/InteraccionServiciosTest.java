package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.Fixtures;
import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.ComentarioNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.ReporteDuplicadoExcepcion;
import com.aldia.dominio.excepcion.ReporteNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.CalificacionPropia;
import com.aldia.dominio.modelo.Comentario;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.ParametrosInteraccion;
import com.aldia.dominio.modelo.Reporte;
import com.aldia.dominio.modelo.ReputacionAutor;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CalificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.ComentarioRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.ReporteRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.ReglasInteraccion;

@ExtendWith(MockitoExtension.class)
class InteraccionServiciosTest {

    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-11-04T15:00:00Z"), ZoneId.of("America/Bogota"));
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 11, 4, 10, 0);
    private static final EjecutorTransaccionalPuerto SIN_TRANSACCION = new EjecutorTransaccionalPuerto() {
        @Override
        public <T> T ejecutar(Supplier<T> bloque) {
            return bloque.get();
        }
    };

    @Mock private ComentarioRepositorioPuerto comentarios;
    @Mock private CalificacionRepositorioPuerto calificaciones;
    @Mock private ReporteRepositorioPuerto reportes;
    @Mock private NoticiaRepositorioPuerto noticias;
    @Mock private UsuarioRepositorioPuerto usuarios;
    @Mock private NotificacionRepositorioPuerto notificaciones;
    @Mock private HistorialRepositorioPuerto historial;

    private final Usuario autor = Fixtures.usuario(1L, Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, 0);
    private final Usuario lector = Fixtures.usuario(2L, Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, 0);
    private final Usuario admin = Fixtures.usuario(3L, Usuario.Rol.ADMINISTRADOR, Fixtures.NIVEL_1, 0);
    private final Noticia noticia = Fixtures.noticia(9L, AHORA, false, 1, 1L);

    private ComentariosServicio comentariosServicio;
    private CalificarNoticiaServicio calificarServicio;
    private ReportesServicio reportesServicio;

    @BeforeEach
    void preparar() {
        ReglasInteraccion reglas = new ReglasInteraccion(new ParametrosInteraccion(1000, 1000, 50, 50));
        comentariosServicio = new ComentariosServicio(comentarios, noticias, usuarios, notificaciones, historial,
                SIN_TRANSACCION, reglas, RELOJ);
        calificarServicio = new CalificarNoticiaServicio(calificaciones, noticias, usuarios, notificaciones, historial,
                SIN_TRANSACCION, reglas, RELOJ);
        reportesServicio = new ReportesServicio(reportes, noticias, usuarios, historial, SIN_TRANSACCION, reglas, RELOJ);
        lenient().when(usuarios.buscarPorCorreo(autor.getCorreo())).thenReturn(Optional.of(autor));
        lenient().when(usuarios.buscarPorCorreo(lector.getCorreo())).thenReturn(Optional.of(lector));
        lenient().when(usuarios.buscarPorCorreo(admin.getCorreo())).thenReturn(Optional.of(admin));
        lenient().when(noticias.buscarPublicadaPorId(9L)).thenReturn(Optional.of(noticia));
    }

    private Comentario comentarioDe(Usuario usuario) {
        return new Comentario(5L, 9L, usuario.getId(), "x", 1, "Buen dato", AHORA);
    }

    // ---------------------------------------------------------------- comentarios

    @Test
    void comentarGuardaRegistraYAvisaAlAutor() {
        when(comentarios.guardar(9L, 2L, "Buen dato", AHORA)).thenReturn(comentarioDe(lector));

        Comentario nuevo = comentariosServicio.comentar(lector.getCorreo(), 9L, "  Buen dato ");

        assertThat(nuevo.id()).isEqualTo(5L);
        verify(historial).registrar(eq(2L), eq(AccionHistorial.COMENTARIO), anyString(), eq(AHORA));
        verify(notificaciones).guardarTodas(any());
    }

    @Test
    void elAutorQueComentaSuNoticiaNoSeAvisaASiMismo() {
        when(comentarios.guardar(9L, 1L, "Aclaro", AHORA)).thenReturn(comentarioDe(autor));
        comentariosServicio.comentar(autor.getCorreo(), 9L, "Aclaro");
        verify(notificaciones, never()).guardarTodas(any());
    }

    @Test
    void noSeComentaUnaNoticiaNoPublicadaNiConCuentaDesactivada() {
        when(noticias.buscarPublicadaPorId(7L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> comentariosServicio.comentar(lector.getCorreo(), 7L, "hola"))
                .isInstanceOf(NoticiaNoEncontradaExcepcion.class);
        assertThatThrownBy(() -> comentariosServicio.listar(7L)).isInstanceOf(NoticiaNoEncontradaExcepcion.class);

        Usuario inactivo = new Usuario(4L, "inactivo@x.com", "h", Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, AHORA,
                false, null, null, 0);
        when(usuarios.buscarPorCorreo("inactivo@x.com")).thenReturn(Optional.of(inactivo));
        assertThatThrownBy(() -> comentariosServicio.comentar("inactivo@x.com", 9L, "hola"))
                .isInstanceOf(CuentaDesactivadaExcepcion.class);
    }

    @Test
    void listaLosComentariosDeUnaNoticiaPublicada() {
        when(comentarios.listarDeNoticia(9L, 50)).thenReturn(List.of(comentarioDe(lector)));
        assertThat(comentariosServicio.listar(9L)).hasSize(1);
    }

    @Test
    void borraElComentarioSuAutorOElAdministradorYNadieMas() {
        when(comentarios.buscarPorId(5L)).thenReturn(Optional.of(comentarioDe(lector)));

        assertThatThrownBy(() -> comentariosServicio.borrar(autor.getCorreo(), 9L, 5L))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        comentariosServicio.borrar(lector.getCorreo(), 9L, 5L);
        comentariosServicio.borrar(admin.getCorreo(), 9L, 5L);
        verify(comentarios, org.mockito.Mockito.times(2)).borrar(5L);

        assertThatThrownBy(() -> comentariosServicio.borrar(admin.getCorreo(), 8L, 5L))
                .isInstanceOf(ComentarioNoEncontradoExcepcion.class);
    }

    // ---------------------------------------------------------------- votos al autor

    @Test
    void elPrimerVotoAvisaAlAutorYCambiarDeOpinionNo() {
        when(calificaciones.buscar(2L, 9L)).thenReturn(Optional.empty(), Optional.of(true));
        when(calificaciones.reputacion(1L)).thenReturn(new ReputacionAutor(1, 1), new ReputacionAutor(0, 1));

        CalificacionPropia primera = calificarServicio.calificar(lector.getCorreo(), 9L, true);
        CalificacionPropia cambio = calificarServicio.calificar(lector.getCorreo(), 9L, false);

        assertThat(primera.recomienda()).isTrue();
        assertThat(primera.reputacion().aprobacion()).isEqualTo(100);
        assertThat(cambio.recomienda()).isFalse();
        assertThat(cambio.reputacion().aprobacion()).isZero();
        verify(calificaciones).guardar(2L, 9L, false, AHORA);
        verify(notificaciones, org.mockito.Mockito.times(1)).guardarTodas(any());
        verify(historial, org.mockito.Mockito.times(2)).registrar(eq(2L), eq(AccionHistorial.CALIFICACION), anyString(),
                eq(AHORA));
    }

    @Test
    void elAutorNoSeVotaASiMismo() {
        assertThatThrownBy(() -> calificarServicio.calificar(autor.getCorreo(), 9L, true))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        verify(calificaciones, never()).guardar(any(), any(), org.mockito.ArgumentMatchers.anyBoolean(), any());
    }

    @Test
    void misVotosSoloConSesion() {
        when(calificaciones.delUsuario(2L, List.of(9L))).thenReturn(Map.of(9L, true));
        assertThat(calificarServicio.misVotos(lector.getCorreo(), List.of(9L))).containsEntry(9L, true);
        assertThat(calificarServicio.misVotos(null, List.of(9L))).isEmpty();
        assertThat(calificarServicio.misVotos(lector.getCorreo(), List.of())).isEmpty();
        when(usuarios.buscarPorCorreo("nadie@x.com")).thenReturn(Optional.empty());
        assertThat(calificarServicio.misVotos("nadie@x.com", List.of(9L))).isEmpty();
    }

    // ---------------------------------------------------------------- reportes

    private Reporte reporte(EstadoReporte estado) {
        return new Reporte(11L, 9L, "Noticia 9", Noticia.Estado.PUBLICADA, 2L, "Lector", MotivoReporte.SPAM, null,
                estado, AHORA);
    }

    @Test
    void reportarUnaVezYRepetirEsConflicto() {
        when(reportes.existe(2L, 9L)).thenReturn(false, true);
        when(reportes.guardar(9L, 2L, MotivoReporte.SPAM, "es publicidad", AHORA)).thenReturn(reporte(EstadoReporte.PENDIENTE));

        assertThat(reportesServicio.reportar(lector.getCorreo(), 9L, MotivoReporte.SPAM, " es publicidad ").id())
                .isEqualTo(11L);
        verify(historial).registrar(eq(2L), eq(AccionHistorial.REPORTE), anyString(), eq(AHORA));
        assertThatThrownBy(() -> reportesServicio.reportar(lector.getCorreo(), 9L, MotivoReporte.SPAM, null))
                .isInstanceOf(ReporteDuplicadoExcepcion.class);
    }

    @Test
    void elAdministradorRevisaODescartaReportes() {
        when(reportes.listar(EstadoReporte.PENDIENTE, 50)).thenReturn(List.of(reporte(EstadoReporte.PENDIENTE)));
        assertThat(reportesServicio.listar(EstadoReporte.PENDIENTE)).hasSize(1);

        when(reportes.buscarPorId(11L)).thenReturn(Optional.of(reporte(EstadoReporte.PENDIENTE)));
        when(reportes.cambiarEstado(11L, EstadoReporte.REVISADO)).thenReturn(reporte(EstadoReporte.REVISADO));
        assertThat(reportesServicio.cambiarEstado(admin.getCorreo(), 11L, EstadoReporte.REVISADO).estado())
                .isEqualTo(EstadoReporte.REVISADO);

        assertThatThrownBy(() -> reportesServicio.cambiarEstado(lector.getCorreo(), 11L, EstadoReporte.DESCARTADO))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        when(reportes.buscarPorId(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> reportesServicio.cambiarEstado(admin.getCorreo(), 99L, EstadoReporte.DESCARTADO))
                .isInstanceOf(ReporteNoEncontradoExcepcion.class);
    }
}
