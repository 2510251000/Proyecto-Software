package com.aldia.dominio.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.aldia.dominio.Fixtures;
import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.ParametrosInteraccion;
import com.aldia.dominio.modelo.ResumenCalificaciones;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;

class ReglasInteraccionTest {

    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 11, 4, 10, 0);

    private final ReglasInteraccion reglas = new ReglasInteraccion(new ParametrosInteraccion(10, 20, 50, 50));
    private final Usuario autor = Fixtures.usuario(1L, Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, 0);
    private final Usuario otro = Fixtures.usuario(2L, Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, 0);
    private final Usuario admin = Fixtures.usuario(3L, Usuario.Rol.ADMINISTRADOR, Fixtures.NIVEL_1, 0);
    private final Noticia noticia = Fixtures.noticia(9L, AHORA, false, 1, 1L);

    @Test
    void elComentarioVaDeUnoAlMaximoDeCaracteres() {
        assertThat(reglas.comentarioValido("  hola  ")).isEqualTo("hola");
        assertThatThrownBy(() -> reglas.comentarioValido("   ")).isInstanceOf(DatosInvalidosExcepcion.class)
                .hasMessage("Escribe un comentario");
        assertThatThrownBy(() -> reglas.comentarioValido(null)).isInstanceOf(DatosInvalidosExcepcion.class);
        assertThatThrownBy(() -> reglas.comentarioValido("x".repeat(11))).isInstanceOf(DatosInvalidosExcepcion.class)
                .hasMessageContaining("máximo 10");
    }

    @Test
    void borraElComentarioSuAutorOUnAdministrador() {
        reglas.verificarPuedeBorrarComentario(autor, 1L);
        reglas.verificarPuedeBorrarComentario(admin, 1L);
        assertThatThrownBy(() -> reglas.verificarPuedeBorrarComentario(otro, 1L))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
    }

    @Test
    void laCalificacionVaDe1A5YNoSobreLaNoticiaPropia() {
        reglas.verificarCalificacion(otro, noticia, 5);
        assertThatThrownBy(() -> reglas.verificarCalificacion(otro, noticia, 0)).isInstanceOf(DatosInvalidosExcepcion.class);
        assertThatThrownBy(() -> reglas.verificarCalificacion(otro, noticia, 6)).isInstanceOf(DatosInvalidosExcepcion.class);
        assertThatThrownBy(() -> reglas.verificarCalificacion(otro, noticia, null)).isInstanceOf(DatosInvalidosExcepcion.class);
        assertThatThrownBy(() -> reglas.verificarCalificacion(autor, noticia, 4))
                .isInstanceOf(AccionNoPermitidaExcepcion.class)
                .hasMessage("No puedes calificar tu propia noticia");
    }

    @Test
    void laDescripcionDelReporteEsOpcionalYTieneLimite() {
        assertThat(reglas.descripcionReporte(null)).isNull();
        assertThat(reglas.descripcionReporte("  ")).isNull();
        assertThat(reglas.descripcionReporte(" falsa ")).isEqualTo("falsa");
        assertThatThrownBy(() -> reglas.descripcionReporte("x".repeat(21))).isInstanceOf(DatosInvalidosExcepcion.class);
    }

    @Test
    void unReporteNoVuelveAPendiente() {
        reglas.verificarCambioReporte(EstadoReporte.REVISADO);
        reglas.verificarCambioReporte(EstadoReporte.DESCARTADO);
        assertThatThrownBy(() -> reglas.verificarCambioReporte(EstadoReporte.PENDIENTE))
                .isInstanceOf(DatosInvalidosExcepcion.class);
        assertThatThrownBy(() -> reglas.verificarCambioReporte(null)).isInstanceOf(DatosInvalidosExcepcion.class);
    }

    @Test
    void avisaAlAutorPeroNoCuandoEsElMismo() {
        Notificacion aviso = reglas.avisoComentario(noticia, otro, AHORA).orElseThrow();
        assertThat(aviso.usuarioId()).isEqualTo(1L);
        assertThat(aviso.tipo()).isEqualTo(TipoNotificacion.COMENTARIO);
        assertThat(aviso.noticiaId()).isEqualTo(9L);
        assertThat(reglas.avisoComentario(noticia, autor, AHORA)).isEmpty();

        assertThat(reglas.avisoCalificacion(noticia, otro, 1, AHORA).orElseThrow().mensaje()).contains("1 estrella ");
        assertThat(reglas.avisoCalificacion(noticia, otro, 4, AHORA).orElseThrow().tipo())
                .isEqualTo(TipoNotificacion.CALIFICACION);
        Noticia sinAutor = Fixtures.noticia(10L, AHORA, true, 1, null);
        assertThat(reglas.avisoCalificacion(sinAutor, otro, 4, AHORA)).isEmpty();
        assertThat(reglas.avisoComentario(sinAutor, otro, AHORA)).isEmpty();
    }

    @Test
    void elPromedioSeRedondeaAUnDecimal() {
        assertThat(new ResumenCalificaciones(3.666, 3).promedio()).isEqualTo(3.7);
        assertThat(noticia.conCalificaciones(null).getCalificaciones()).isEqualTo(ResumenCalificaciones.VACIO);
        assertThat(reglas.parametros().maximoReportesListado()).isEqualTo(50);
    }
}
