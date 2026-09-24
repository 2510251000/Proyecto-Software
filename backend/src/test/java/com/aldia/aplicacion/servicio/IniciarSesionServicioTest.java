package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class IniciarSesionServicioTest {

    private static final String CORREO = "prueba@correo.com";
    private static final String CONTRASENA = "clave12345";
    private static final String CONTRASENA_CIFRADA = "hash-bcrypt";

    @Mock
    private UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    @Mock
    private CifradorPuerto cifradorPuerto;

    @Mock
    private TokenPuerto tokenPuerto;

    @InjectMocks
    private IniciarSesionServicio servicio;

    private Usuario usuarioGuardado() {
        return new Usuario(1L, CORREO, CONTRASENA_CIFRADA, Usuario.Rol.USUARIO_COMUN,
                new Nivel(1L, "Básico", 3), LocalDateTime.now());
    }

    @Test
    void devuelveTokenConCredencialesCorrectas() {
        Usuario usuario = usuarioGuardado();
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.of(usuario));
        when(cifradorPuerto.coincide(CONTRASENA, CONTRASENA_CIFRADA)).thenReturn(true);
        when(tokenPuerto.generarToken(usuario)).thenReturn("token-generado");

        String token = servicio.iniciarSesion(CORREO, CONTRASENA);

        assertThat(token).isEqualTo("token-generado");
    }

    @Test
    void rechazaCorreoInexistente() {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.iniciarSesion(CORREO, CONTRASENA))
                .isInstanceOf(CredencialesInvalidasExcepcion.class);

        verify(tokenPuerto, never()).generarToken(any());
    }

    @Test
    void rechazaContrasenaIncorrectaConElMismoMensaje() {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.of(usuarioGuardado()));
        when(cifradorPuerto.coincide("otraClave", CONTRASENA_CIFRADA)).thenReturn(false);

        // Mismo error que con correo inexistente: no se revela cuál de los dos falló.
        assertThatThrownBy(() -> servicio.iniciarSesion(CORREO, "otraClave"))
                .isInstanceOf(CredencialesInvalidasExcepcion.class);

        verify(tokenPuerto, never()).generarToken(any());
    }

    @Test
    void rechazaCuentaDesactivadaAunqueLaContrasenaSeaCorrecta() {
        Usuario desactivado = new Usuario(1L, CORREO, CONTRASENA_CIFRADA, Usuario.Rol.USUARIO_COMUN,
                new Nivel(1L, "Básico", 3), LocalDateTime.now(), false);
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.of(desactivado));
        when(cifradorPuerto.coincide(CONTRASENA, CONTRASENA_CIFRADA)).thenReturn(true);

        assertThatThrownBy(() -> servicio.iniciarSesion(CORREO, CONTRASENA))
                .isInstanceOf(CuentaDesactivadaExcepcion.class);

        verify(tokenPuerto, never()).generarToken(any());
    }
}
