package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.NIVEL_1;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
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
import com.aldia.dominio.excepcion.AlertaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.Alerta;
import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoAlerta;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.AlertaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;

@ExtendWith(MockitoExtension.class)
class AlertasServicioTest {

    private static final String CORREO = "vecina@correo.com";
    private static final Long USUARIO_ID = 3L;
    private static final Long AUTOR_ID = 1L;
    private static final Long CIUDAD_ID = 10L;
    private static final int HORAS = 72;

    // 24/09/2026 10:00 a. m. en Bogotá.
    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-09-24T15:00:00Z"), ZoneId.of("America/Bogota"));
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 9, 24, 10, 0);

    private static final EjecutorTransaccionalPuerto SIN_TRANSACCION = new EjecutorTransaccionalPuerto() {
        @Override
        public <T> T ejecutar(Supplier<T> bloque) {
            return bloque.get();
        }
    };

    @Mock
    private AlertaRepositorioPuerto alertas;

    @Mock
    private UsuarioRepositorioPuerto usuarios;

    @Mock
    private NotificacionRepositorioPuerto notificaciones;

    @Captor
    private ArgumentCaptor<List<Notificacion>> avisos;

    private AlertasServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new AlertasServicio(alertas, usuarios, notificaciones, SIN_TRANSACCION, new AvisosPorCiudad(),
                RELOJ, HORAS);
    }

    private static Usuario usuario(Long id, Usuario.Rol rol, Ciudad ciudad) {
        return new Usuario(id, CORREO, "hash", rol, NIVEL_1, LocalDateTime.of(2026, 9, 1, 8, 0), true, "Vecina",
                ciudad, 0);
    }

    private static Alerta alerta(Long noticiaId, boolean activa, LocalDateTime fecha) {
        return new Alerta(noticiaId, TipoAlerta.DESAPARICION, "Se busca a Ana", "Vista en el parque", "Fusagasugá",
                CIUDAD_ID, AUTOR_ID, fecha, activa, activa ? null : AHORA);
    }

    private void sesion(Usuario usuario) {
        when(usuarios.buscarPorCorreo(CORREO)).thenReturn(Optional.of(usuario));
    }

    @Test
    void sinCiudadEnLaConsultaUsaLaCiudadDelUsuario() {
        sesion(usuario(USUARIO_ID, Usuario.Rol.USUARIO_COMUN, new Ciudad(CIUDAD_ID, "Fusagasugá", "Cundinamarca",
                null, null, null)));
        List<Alerta> vigentes = List.of(alerta(50L, true, AHORA.minusHours(2)));
        when(alertas.activasDesde(CIUDAD_ID, AHORA.minusHours(HORAS))).thenReturn(vigentes);

        assertThat(servicio.vigentes(CORREO, null)).isEqualTo(vigentes);
    }

    @Test
    void conCiudadEnLaConsultaNoBuscaAlUsuario() {
        when(alertas.activasDesde(20L, AHORA.minusHours(HORAS))).thenReturn(List.of());

        assertThat(servicio.vigentes(CORREO, 20L)).isEmpty();
        verify(usuarios, never()).buscarPorCorreo(any());
    }

    @Test
    void usuarioSinCiudadVeLasAlertasDeTodasLasCiudades() {
        sesion(usuario(USUARIO_ID, Usuario.Rol.USUARIO_COMUN, null));
        when(alertas.activasDesde(null, AHORA.minusHours(HORAS))).thenReturn(List.of());

        assertThat(servicio.vigentes(CORREO, null)).isEmpty();
    }

    @Test
    void pendientesSonLasNoLeidasDeAlertasQueSiguenVigentes() {
        sesion(usuario(USUARIO_ID, Usuario.Rol.USUARIO_COMUN, null));
        when(notificaciones.listarNoLeidasDeTipo(USUARIO_ID, TipoNotificacion.ALERTA)).thenReturn(List.of(
                new Notificacion(900L, USUARIO_ID, TipoNotificacion.ALERTA, "a", 50L, false, AHORA),
                new Notificacion(901L, USUARIO_ID, TipoNotificacion.ALERTA, "b", 51L, false, AHORA),
                new Notificacion(902L, USUARIO_ID, TipoNotificacion.ALERTA, "c", 52L, false, AHORA),
                new Notificacion(903L, USUARIO_ID, TipoNotificacion.ALERTA, "d", 53L, false, AHORA)));
        when(alertas.buscarTodas(List.of(50L, 51L, 52L, 53L))).thenReturn(List.of(
                alerta(50L, true, AHORA.minusHours(1)),
                alerta(51L, false, AHORA.minusHours(1)),
                alerta(52L, true, AHORA.minusHours(HORAS + 1))));

        List<Alerta.Pendiente> pendientes = servicio.pendientes(CORREO);

        // 51 ya se resolvió, 52 venció y 53 ya no está publicada.
        assertThat(pendientes).extracting(Alerta.Pendiente::notificacionId).containsExactly(900L);
        assertThat(pendientes.get(0).alerta().noticiaId()).isEqualTo(50L);
    }

    @Test
    void sinNotificacionesDeAlertaNoConsultaLasAlertas() {
        sesion(usuario(USUARIO_ID, Usuario.Rol.USUARIO_COMUN, null));
        when(notificaciones.listarNoLeidasDeTipo(USUARIO_ID, TipoNotificacion.ALERTA)).thenReturn(List.of());

        assertThat(servicio.pendientes(CORREO)).isEmpty();
        verify(alertas, never()).buscarTodas(anyList());
    }

    @Test
    void unaNoticiaSinAlertaDa404() {
        when(alertas.buscar(50L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.deNoticia(50L)).isInstanceOf(AlertaNoEncontradaExcepcion.class);
    }

    @Test
    void elAutorResuelveSuAlertaYSeAvisaALaCiudad() {
        sesion(usuario(AUTOR_ID, Usuario.Rol.USUARIO_COMUN, null));
        Alerta resuelta = alerta(50L, false, AHORA.minusHours(1));
        when(alertas.buscar(50L)).thenReturn(Optional.of(alerta(50L, true, AHORA.minusHours(1))),
                Optional.of(resuelta));
        when(usuarios.idsActivosEnCiudad(CIUDAD_ID)).thenReturn(List.of(AUTOR_ID, 7L));

        assertThat(servicio.resolver(CORREO, 50L)).isEqualTo(resuelta);

        verify(alertas).resolver(50L, AHORA);
        verify(notificaciones).guardarTodas(avisos.capture());
        assertThat(avisos.getValue()).singleElement().satisfies(aviso -> {
            assertThat(aviso.usuarioId()).isEqualTo(7L);
            assertThat(aviso.mensaje()).isEqualTo("Alerta resuelta en Fusagasugá: Se busca a Ana");
        });
    }

    @Test
    void unAdministradorTambienPuedeResolverla() {
        sesion(usuario(99L, Usuario.Rol.ADMINISTRADOR, null));
        when(alertas.buscar(50L)).thenReturn(Optional.of(alerta(50L, true, AHORA)));

        servicio.resolver(CORREO, 50L);

        verify(alertas).resolver(50L, AHORA);
    }

    @Test
    void otroUsuarioNoPuedeResolverla() {
        sesion(usuario(USUARIO_ID, Usuario.Rol.USUARIO_COMUN, null));
        when(alertas.buscar(50L)).thenReturn(Optional.of(alerta(50L, true, AHORA)));

        assertThatThrownBy(() -> servicio.resolver(CORREO, 50L)).isInstanceOf(AccionNoPermitidaExcepcion.class);
        verify(alertas, never()).resolver(any(), any());
    }

    @Test
    void resolverUnaAlertaYaResueltaNoVuelveAAvisar() {
        sesion(usuario(AUTOR_ID, Usuario.Rol.USUARIO_COMUN, null));
        when(alertas.buscar(50L)).thenReturn(Optional.of(alerta(50L, false, AHORA)));

        servicio.resolver(CORREO, 50L);

        verify(alertas, never()).resolver(any(), any());
        verify(notificaciones, never()).guardarTodas(anyList());
    }
}
