package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.NIVELES;
import static com.aldia.dominio.Fixtures.NIVEL_1;
import static com.aldia.dominio.Fixtures.NIVEL_2;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.LimiteDiarioAlcanzadoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.NuevaNoticia;
import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;
import com.aldia.dominio.servicio.CalculadoraNivel;
import com.aldia.dominio.servicio.ReglaLimiteDiario;

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

    /** Ejecuta el bloque tal cual: en las pruebas no hay base de datos. */
    private static final EjecutorTransaccionalPuerto SIN_TRANSACCION = new EjecutorTransaccionalPuerto() {
        @Override
        public <T> T ejecutar(java.util.function.Supplier<T> bloque) {
            return bloque.get();
        }
    };

    @Mock
    private UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    @Mock
    private CiudadRepositorioPuerto ciudadRepositorioPuerto;

    @Mock
    private NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    @Mock
    private HistorialRepositorioPuerto historialRepositorioPuerto;

    @Mock
    private NivelRepositorioPuerto nivelRepositorioPuerto;

    @Mock
    private NotificacionRepositorioPuerto notificacionRepositorioPuerto;

    @Captor
    private ArgumentCaptor<List<Notificacion>> notificaciones;

    @Captor
    private ArgumentCaptor<Usuario> usuarioGuardado;

    private PublicarNoticiaServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new PublicarNoticiaServicio(usuarioRepositorioPuerto, ciudadRepositorioPuerto,
                noticiaRepositorioPuerto, historialRepositorioPuerto, nivelRepositorioPuerto,
                notificacionRepositorioPuerto, SIN_TRANSACCION, new ReglaLimiteDiario(true),
                new CalculadoraNivel(new ParametrosNiveles(10, 20)), new AvisosPorCiudad(), RELOJ);
        lenient().when(nivelRepositorioPuerto.listarTodos()).thenReturn(NIVELES);
    }

    private Usuario autor(Usuario.Rol rol, boolean activo, Nivel nivel, int puntaje) {
        return new Usuario(AUTOR_ID, CORREO, "hash", rol, nivel,
                LocalDateTime.of(2026, 9, 1, 8, 0), activo, "Autora", null, puntaje);
    }

    private Usuario autor(Usuario.Rol rol, boolean activo) {
        return autor(rol, activo, NIVEL_1, 0);
    }

    private Noticia noticiaGuardada(boolean oficial) {
        return new Noticia(50L, DATOS.titulo(), DATOS.resumen(), DATOS.contenido(), AHORA,
                oficial, Noticia.Estado.PUBLICADA, "Fusagasugá");
    }

    private void autorYCiudadValidos(Usuario autor) {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.of(autor));
        when(ciudadRepositorioPuerto.existePorId(CIUDAD_ID)).thenReturn(true);
    }

    @Test
    void usuarioComunPublicaNoticiaNoOficialYQuedaEnHistorial() {
        autorYCiudadValidos(autor(Usuario.Rol.USUARIO_COMUN, true));
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(0L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, false, AHORA)).thenReturn(noticiaGuardada(false));

        Noticia publicada = servicio.publicar(CORREO, DATOS);

        assertThat(publicada.getId()).isEqualTo(50L);
        assertThat(publicada.isOficial()).isFalse();
        verify(historialRepositorioPuerto).registrar(eq(AUTOR_ID), eq(AccionHistorial.PUBLICACION),
                anyString(), eq(AHORA));
    }

    @Test
    void avisaALosUsuariosDeLaMismaCiudadMenosAlAutor() {
        autorYCiudadValidos(autor(Usuario.Rol.USUARIO_COMUN, true));
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(0L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, false, AHORA)).thenReturn(noticiaGuardada(false));
        when(usuarioRepositorioPuerto.idsActivosEnCiudad(CIUDAD_ID)).thenReturn(List.of(AUTOR_ID, 7L, 8L));

        servicio.publicar(CORREO, DATOS);

        verify(notificacionRepositorioPuerto, atLeastOnce()).guardarTodas(notificaciones.capture());
        List<Notificacion> avisos = notificaciones.getAllValues().get(0);
        assertThat(avisos).extracting(Notificacion::usuarioId).containsExactly(7L, 8L);
        assertThat(avisos).allSatisfy(n -> {
            assertThat(n.tipo()).isEqualTo(TipoNotificacion.CERCANIA);
            assertThat(n.noticiaId()).isEqualTo(50L);
        });
    }

    @Test
    void sumaPuntosAlAutorYLeAvisaSiSubeDeNivel() {
        autorYCiudadValidos(autor(Usuario.Rol.USUARIO_COMUN, true, NIVEL_1, 40));
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(0L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, false, AHORA)).thenReturn(noticiaGuardada(false));

        servicio.publicar(CORREO, DATOS);

        verify(usuarioRepositorioPuerto).guardar(usuarioGuardado.capture());
        assertThat(usuarioGuardado.getValue().getPuntaje()).isEqualTo(50);
        assertThat(usuarioGuardado.getValue().getNivel()).isEqualTo(NIVEL_2);
        verify(historialRepositorioPuerto).registrar(eq(AUTOR_ID), eq(AccionHistorial.CAMBIO_NIVEL), anyString(), eq(AHORA));
        verify(notificacionRepositorioPuerto, atLeastOnce()).guardarTodas(notificaciones.capture());
        assertThat(notificaciones.getAllValues()).flatExtracting(lista -> lista)
                .extracting(Notificacion::tipo)
                .contains(TipoNotificacion.ASCENSO_NIVEL);
    }

    @Test
    void administradorPublicaNoticiaOficialSinLimiteNiPuntos() {
        autorYCiudadValidos(autor(Usuario.Rol.ADMINISTRADOR, true));
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(25L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, true, AHORA)).thenReturn(noticiaGuardada(true));

        assertThat(servicio.publicar(CORREO, DATOS).isOficial()).isTrue();
        verify(usuarioRepositorioPuerto, never()).guardar(any());
    }

    @Test
    void puedePublicarLaUltimaNoticiaQueLeQuedaHoy() {
        autorYCiudadValidos(autor(Usuario.Rol.USUARIO_COMUN, true));
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(2L);
        when(noticiaRepositorioPuerto.guardarNueva(DATOS, AUTOR_ID, false, AHORA)).thenReturn(noticiaGuardada(false));

        assertThat(servicio.publicar(CORREO, DATOS)).isNotNull();
    }

    @Test
    void rechazaCuandoYaAlcanzoElLimiteDiarioDeSuNivel() {
        autorYCiudadValidos(autor(Usuario.Rol.USUARIO_COMUN, true));
        when(noticiaRepositorioPuerto.contarDelAutorDesde(AUTOR_ID, INICIO_DEL_DIA)).thenReturn(3L);

        assertThatThrownBy(() -> servicio.publicar(CORREO, DATOS))
                .isInstanceOf(LimiteDiarioAlcanzadoExcepcion.class)
                .hasMessage("Alcanzaste el límite de 3 noticias por día de tu nivel Básico");

        verify(noticiaRepositorioPuerto, never()).guardarNueva(any(), anyLong(), anyBoolean(), any());
        verify(historialRepositorioPuerto, never()).registrar(any(), any(), any(), any());
        verify(notificacionRepositorioPuerto, never()).guardarTodas(any());
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
