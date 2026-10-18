package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.LimiteDiarioAlcanzadoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class PublicarNoticiaServicioTest {

    private static final String CORREO = "autor@correo.com";
    private static final Long AUTOR_ID = 1L;
    private static final Long CIUDAD_ID = 10L;
    private static final ZoneId BOGOTA = ZoneId.of("America/Bogota");

    // 24/09/2026 10:00 a. m. en Bogotá (15:00 UTC).
    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-09-24T15:00:00Z"), BOGOTA);
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 9, 24, 10, 0);
    private static final LocalDateTime INICIO_DEL_DIA = LocalDateTime.of(2026, 9, 24, 0, 0);

    private static final NuevaNoticia DATOS = new NuevaNoticia(
            "Cierre de la vía", "Resumen", "Contenido", CIUDAD_ID,
            new BigDecimal("4.33722"), new BigDecimal("-74.36389"), "ChIJ-prueba");

    @Mock
    private UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    @Mock
    private CiudadRepositorioPuerto ciudadRepositorioPuerto;

    @Mock
    private NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    @Mock
    private HistorialRepositorioPuerto historialRepositorioPuerto;

    private PublicarNoticiaServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new PublicarNoticiaServicio(usuarioRepositorioPuerto, ciudadRepositorioPuerto,
                noticiaRepositorioPuerto, historialRepositorioPuerto, RELOJ);
    }

    private Usuario autor(Usuario.Rol rol, boolean activo) {
        return new Usuario(AUTOR_ID, CORREO, "hash", rol, new Nivel(1L, "Básico", 3),
                LocalDateTime.of(2026, 9, 1, 8, 0), activo);
    }

    private Noticia noticiaGuardada(boolean oficial) {
        return new Noticia(50L, DATOS.titulo(), DATOS.resumen(), DATOS.contenido(), AHORA,
                oficial, Noticia.Estado.PUBLICADA, "Fusagasugá");
    }

    private void autorYCiudadValidos(Usuario.Rol rol) {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.of(autor(rol, true)));
        when(ciudadRepositorioPuerto.existePorId(CIUDAD_ID)).thenReturn(true);
    }

    @Test
    void usuarioComunPublicaNoticiaNoOficialYQuedaEnHistorial() {
        autorYCiudadValidos(Usuario.Rol.USUARIO_COMUN);
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(0L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, false, AHORA)).thenReturn(noticiaGuardada(false));

        Noticia publicada = servicio.publicar(CORREO, DATOS);

        assertThat(publicada.getId()).isEqualTo(50L);
        assertThat(publicada.isOficial()).isFalse();
        verify(historialRepositorioPuerto).registrar(eq(AUTOR_ID), eq(AccionHistorial.PUBLICACION),
                anyString(), eq(AHORA));
    }

    @Test
    void administradorPublicaNoticiaOficial() {
        autorYCiudadValidos(Usuario.Rol.ADMINISTRADOR);
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(0L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, true, AHORA)).thenReturn(noticiaGuardada(true));

        assertThat(servicio.publicar(CORREO, DATOS).isOficial()).isTrue();
    }

    @Test
    void puedePublicarLaUltimaNoticiaQueLeQuedaHoy() {
        autorYCiudadValidos(Usuario.Rol.USUARIO_COMUN);
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(2L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, false, AHORA)).thenReturn(noticiaGuardada(false));

        assertThat(servicio.publicar(CORREO, DATOS)).isNotNull();
    }

    @Test
    void rechazaCuandoYaAlcanzoElLimiteDiarioDeSuNivel() {
        autorYCiudadValidos(Usuario.Rol.USUARIO_COMUN);
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(3L);

        assertThatThrownBy(() -> servicio.publicar(CORREO, DATOS))
                .isInstanceOf(LimiteDiarioAlcanzadoExcepcion.class)
                .hasMessage("Alcanzaste el límite de 3 noticias por día de tu nivel Básico");

        verify(noticiaRepositorioPuerto, never()).guardarNueva(any(), anyLong(), anyBoolean(), any());
        verify(historialRepositorioPuerto, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void rechazaCiudadInexistenteSinContarNiGuardar() {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO))
                .thenReturn(Optional.of(autor(Usuario.Rol.USUARIO_COMUN, true)));
        when(ciudadRepositorioPuerto.existePorId(CIUDAD_ID)).thenReturn(false);

        assertThatThrownBy(() -> servicio.publicar(CORREO, DATOS))
                .isInstanceOf(CiudadNoEncontradaExcepcion.class);

        verify(noticiaRepositorioPuerto, never()).contarDelAutorDesde(any(), any());
        verify(noticiaRepositorioPuerto, never()).guardarNueva(any(), anyLong(), anyBoolean(), any());
    }

    @Test
    void rechazaCuentaDesactivada() {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO))
                .thenReturn(Optional.of(autor(Usuario.Rol.USUARIO_COMUN, false)));

        assertThatThrownBy(() -> servicio.publicar(CORREO, DATOS))
                .isInstanceOf(CuentaDesactivadaExcepcion.class);

        verify(noticiaRepositorioPuerto, never()).guardarNueva(any(), anyLong(), anyBoolean(), any());
    }
}
