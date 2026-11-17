package com.aldia.aplicacion.servicio;

import static com.aldia.dominio.Fixtures.NIVEL_1;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.function.Supplier;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.IdentidadExterna;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.puerto.salida.VerificadorIdentidadPuerto;

@ExtendWith(MockitoExtension.class)
class IniciarSesionExternaServicioTest {

    private static final Clock RELOJ = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Bogota"));
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 11, 17, 10, 0);

    private static final EjecutorTransaccionalPuerto SIN_TRANSACCION = new EjecutorTransaccionalPuerto() {
        @Override
        public <T> T ejecutar(Supplier<T> bloque) {
            return bloque.get();
        }
    };

    @Mock
    private VerificadorIdentidadPuerto verificador;
    @Mock
    private UsuarioRepositorioPuerto usuarios;
    @Mock
    private NivelRepositorioPuerto niveles;
    @Mock
    private CifradorPuerto cifrador;
    @Mock
    private TokenPuerto token;
    @Mock
    private HistorialRepositorioPuerto historial;
    @Captor
    private ArgumentCaptor<Usuario> guardado;

    private IniciarSesionExternaServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new IniciarSesionExternaServicio(verificador, usuarios, niveles, cifrador, token, historial,
                SIN_TRANSACCION, RELOJ);
    }

    private static Usuario existente(boolean activo) {
        return new Usuario(5L, "ana@gmail.com", "hash", Usuario.Rol.USUARIO_COMUN, NIVEL_1,
                LocalDateTime.of(2026, 10, 1, 8, 0), activo, "Ana", null, 30);
    }

    @Test
    void unaCuentaQueYaExisteEntraConElMismoCorreo() {
        when(verificador.verificar("tok")).thenReturn(new IdentidadExterna("Ana@Gmail.com ", "Ana Pérez"));
        when(usuarios.buscarPorCorreo("ana@gmail.com")).thenReturn(Optional.of(existente(true)));
        when(token.generarToken(any())).thenReturn("jwt");

        assertThat(servicio.iniciarSesion("tok")).isEqualTo("jwt");
        verify(usuarios, never()).guardar(any());
        verify(historial).registrar(5L, AccionHistorial.INICIO_SESION, "Inició sesión con Google", AHORA);
    }

    @Test
    void unCorreoNuevoCreaUnUsuarioComunSinCiudadNiContrasenaConocida() {
        when(verificador.verificar("tok")).thenReturn(new IdentidadExterna("nuevo@gmail.com", "  Nuevo Vecino "));
        when(usuarios.buscarPorCorreo("nuevo@gmail.com")).thenReturn(Optional.empty());
        when(niveles.buscarNivelInicial()).thenReturn(Optional.of(NIVEL_1));
        when(cifrador.cifrar(anyString())).thenReturn("hash-al-azar");
        when(usuarios.guardar(guardado.capture())).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            return new Usuario(9L, u.getCorreo(), u.getContrasenaCifrada(), u.getRol(), u.getNivel(),
                    u.getFechaRegistro(), true, u.getNombre(), null, 0);
        });
        when(token.generarToken(any())).thenReturn("jwt");

        assertThat(servicio.iniciarSesion("tok")).isEqualTo("jwt");

        Usuario nuevo = guardado.getValue();
        assertThat(nuevo.getRol()).isEqualTo(Usuario.Rol.USUARIO_COMUN);
        assertThat(nuevo.getNombre()).isEqualTo("Nuevo Vecino");
        assertThat(nuevo.getCiudad()).isNull();
        assertThat(nuevo.getContrasenaCifrada()).isEqualTo("hash-al-azar");
        verify(historial).registrar(9L, AccionHistorial.REGISTRO, "Creó su cuenta con Google", AHORA);
        verify(historial).registrar(eq(9L), eq(AccionHistorial.INICIO_SESION), anyString(), eq(AHORA));
    }

    @Test
    void sinNombreEnGoogleQuedaSinNombre() {
        when(verificador.verificar("tok")).thenReturn(new IdentidadExterna("x@gmail.com", null));
        when(usuarios.buscarPorCorreo("x@gmail.com")).thenReturn(Optional.empty());
        when(niveles.buscarNivelInicial()).thenReturn(Optional.of(NIVEL_1));
        when(usuarios.guardar(guardado.capture())).thenAnswer(inv -> inv.getArgument(0));

        servicio.iniciarSesion("tok");

        assertThat(guardado.getValue().getNombre()).isNull();
    }

    @Test
    void unaCuentaDesactivadaNoEntra() {
        when(verificador.verificar("tok")).thenReturn(new IdentidadExterna("ana@gmail.com", "Ana"));
        when(usuarios.buscarPorCorreo("ana@gmail.com")).thenReturn(Optional.of(existente(false)));

        assertThatThrownBy(() -> servicio.iniciarSesion("tok")).isInstanceOf(CuentaDesactivadaExcepcion.class);
        verify(token, never()).generarToken(any());
    }

    @Test
    void unTokenInvalidoNoBuscaNada() {
        when(verificador.verificar("malo")).thenThrow(new CredencialesInvalidasExcepcion("no"));

        assertThatThrownBy(() -> servicio.iniciarSesion("malo")).isInstanceOf(CredencialesInvalidasExcepcion.class);
        verify(usuarios, never()).buscarPorCorreo(anyString());
    }
}
