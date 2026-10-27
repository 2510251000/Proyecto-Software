package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.FUSAGASUGA;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.aldia.dominio.excepcion.NivelInicialNoConfiguradoExcepcion;
import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.NuevoUsuario;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class RegistrarUsuarioServicioTest {

    private static final String CORREO = "nuevo@correo.com";
    private static final String CONTRASENA = "clave12345";
    private static final String CONTRASENA_CIFRADA = "hash-bcrypt";
    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-10-18T15:00:00Z"), ZoneId.of("America/Bogota"));
    private static final NuevoUsuario DATOS = new NuevoUsuario(CORREO, CONTRASENA, "  Ana Pérez ", FUSAGASUGA.id());

    @Mock
    private UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    @Mock
    private NivelRepositorioPuerto nivelRepositorioPuerto;

    @Mock
    private CiudadRepositorioPuerto ciudadRepositorioPuerto;

    @Mock
    private CifradorPuerto cifradorPuerto;

    private RegistrarUsuarioServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new RegistrarUsuarioServicio(usuarioRepositorioPuerto, nivelRepositorioPuerto,
                ciudadRepositorioPuerto, cifradorPuerto, RELOJ);
    }

    @Test
    void registraUsuarioConContrasenaCifradaRolComunNivelInicialYCiudad() {
        Nivel nivelInicial = new Nivel(7L, 1, "Básico", 0, 3);
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(false);
        when(ciudadRepositorioPuerto.buscarPorId(FUSAGASUGA.id())).thenReturn(Optional.of(FUSAGASUGA));
        when(cifradorPuerto.cifrar(CONTRASENA)).thenReturn(CONTRASENA_CIFRADA);
        when(nivelRepositorioPuerto.buscarNivelInicial()).thenReturn(Optional.of(nivelInicial));
        when(usuarioRepositorioPuerto.guardar(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario registrado = servicio.registrar(DATOS);

        assertThat(registrado.getCorreo()).isEqualTo(CORREO);
        assertThat(registrado.getContrasenaCifrada()).isEqualTo(CONTRASENA_CIFRADA);
        assertThat(registrado.getRol()).isEqualTo(Usuario.Rol.USUARIO_COMUN);
        assertThat(registrado.getNivel()).isSameAs(nivelInicial);
        assertThat(registrado.getCiudad()).isEqualTo(FUSAGASUGA);
        assertThat(registrado.getNombre()).isEqualTo("Ana Pérez");
        assertThat(registrado.getPuntaje()).isZero();
        assertThat(registrado.getFechaRegistro()).isEqualTo(LocalDateTime.of(2026, 10, 18, 10, 0));
    }

    @Test
    void rechazaCorreoRepetidoSinGuardarNada() {
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(true);

        assertThatThrownBy(() -> servicio.registrar(DATOS))
                .isInstanceOf(UsuarioYaExisteExcepcion.class);

        verify(usuarioRepositorioPuerto, never()).guardar(any());
        verify(cifradorPuerto, never()).cifrar(any());
    }

    @Test
    void rechazaUnaCiudadQueNoEstaEnElCatalogo() {
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(false);
        when(ciudadRepositorioPuerto.buscarPorId(FUSAGASUGA.id())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.registrar(DATOS))
                .isInstanceOf(CiudadNoEncontradaExcepcion.class);

        verify(usuarioRepositorioPuerto, never()).guardar(any());
    }

    @Test
    void fallaSiNoHayNivelesConfigurados() {
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(false);
        when(ciudadRepositorioPuerto.buscarPorId(FUSAGASUGA.id())).thenReturn(Optional.of(FUSAGASUGA));
        when(cifradorPuerto.cifrar(CONTRASENA)).thenReturn(CONTRASENA_CIFRADA);
        when(nivelRepositorioPuerto.buscarNivelInicial()).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.registrar(DATOS))
                .isInstanceOf(NivelInicialNoConfiguradoExcepcion.class);

        verify(usuarioRepositorioPuerto, never()).guardar(any());
    }
}
