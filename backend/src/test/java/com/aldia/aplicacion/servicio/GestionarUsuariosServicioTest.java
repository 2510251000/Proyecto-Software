package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.NIVELES;
import static com.aldia.dominio.Fixtures.NIVEL_1;
import static com.aldia.dominio.Fixtures.NIVEL_3;
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
import java.time.ZoneId;
import java.util.Optional;
import java.util.function.Supplier;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.modelo.CambiosUsuario;
import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.CalculadoraNivel;

@ExtendWith(MockitoExtension.class)
class GestionarUsuariosServicioTest {

    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-10-18T15:00:00Z"), ZoneId.of("America/Bogota"));
    private static final Usuario ADMIN = usuario(1L, Usuario.Rol.ADMINISTRADOR, NIVEL_1, 0);
    private static final Usuario COMUN = usuario(2L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 10);

    private static final EjecutorTransaccionalPuerto SIN_TRANSACCION = new EjecutorTransaccionalPuerto() {
        @Override
        public <T> T ejecutar(Supplier<T> bloque) {
            return bloque.get();
        }
    };

    @Mock
    private UsuarioRepositorioPuerto usuarios;
    @Mock
    private NivelRepositorioPuerto niveles;
    @Mock
    private NotificacionRepositorioPuerto notificaciones;
    @Mock
    private HistorialRepositorioPuerto historial;

    private GestionarUsuariosServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new GestionarUsuariosServicio(usuarios, niveles, notificaciones, historial, SIN_TRANSACCION,
                new CalculadoraNivel(new ParametrosNiveles(10, 20)), RELOJ);
        lenient().when(niveles.listarTodos()).thenReturn(NIVELES);
        lenient().when(usuarios.buscarPorCorreo(ADMIN.getCorreo())).thenReturn(Optional.of(ADMIN));
        lenient().when(usuarios.buscarPorId(ADMIN.getId())).thenReturn(Optional.of(ADMIN));
        lenient().when(usuarios.buscarPorId(COMUN.getId())).thenReturn(Optional.of(COMUN));
        lenient().when(usuarios.guardar(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void fijarElNivelDejaElPuntajeEnElMinimoDeEseNivelYAvisa() {
        Usuario resultado = servicio.actualizar(ADMIN.getCorreo(), COMUN.getId(), new CambiosUsuario(null, null, 3));

        assertThat(resultado.getNivel()).isEqualTo(NIVEL_3);
        assertThat(resultado.getPuntaje()).isEqualTo(NIVEL_3.getPuntajeMinimo());
        verify(notificaciones).guardarTodas(any());
    }

    @Test
    void desactivaUnaCuenta() {
        Usuario resultado = servicio.actualizar(ADMIN.getCorreo(), COMUN.getId(), new CambiosUsuario(false, null, null));

        assertThat(resultado.isActivo()).isFalse();
        verify(notificaciones, never()).guardarTodas(any());
    }

    @Test
    void unAdministradorNoPuedeDesactivarseNiQuitarseElRol() {
        assertThatThrownBy(() -> servicio.actualizar(ADMIN.getCorreo(), ADMIN.getId(), new CambiosUsuario(false, null, null)))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        assertThatThrownBy(() -> servicio.actualizar(ADMIN.getCorreo(), ADMIN.getId(),
                new CambiosUsuario(null, Usuario.Rol.USUARIO_COMUN, null)))
                .isInstanceOf(AccionNoPermitidaExcepcion.class);
        verify(usuarios, never()).guardar(any());
    }

    @Test
    void rechazaUnNivelQueNoExiste() {
        assertThatThrownBy(() -> servicio.actualizar(ADMIN.getCorreo(), COMUN.getId(), new CambiosUsuario(null, null, 9)))
                .isInstanceOf(DatosInvalidosExcepcion.class);
    }
}
