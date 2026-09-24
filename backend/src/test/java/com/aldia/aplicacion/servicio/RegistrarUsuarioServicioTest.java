package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.NivelInicialNoConfiguradoExcepcion;
import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class RegistrarUsuarioServicioTest {

    private static final String CORREO = "nuevo@correo.com";
    private static final String CONTRASENA = "clave12345";
    private static final String CONTRASENA_CIFRADA = "hash-bcrypt";

    @Mock
    private UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    @Mock
    private NivelRepositorioPuerto nivelRepositorioPuerto;

    @Mock
    private CifradorPuerto cifradorPuerto;

    @InjectMocks
    private RegistrarUsuarioServicio servicio;

    @Test
    void registraUsuarioConContrasenaCifradaRolComunYNivelInicial() {
        Nivel nivelInicial = new Nivel(7L, "Básico", 3);
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(false);
        when(cifradorPuerto.cifrar(CONTRASENA)).thenReturn(CONTRASENA_CIFRADA);
        when(nivelRepositorioPuerto.buscarNivelInicial()).thenReturn(Optional.of(nivelInicial));
        when(usuarioRepositorioPuerto.guardar(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario registrado = servicio.registrar(CORREO, CONTRASENA);

        assertThat(registrado.getCorreo()).isEqualTo(CORREO);
        assertThat(registrado.getContrasenaCifrada()).isEqualTo(CONTRASENA_CIFRADA);
        assertThat(registrado.getContrasenaCifrada()).isNotEqualTo(CONTRASENA);
        assertThat(registrado.getRol()).isEqualTo(Usuario.Rol.USUARIO_COMUN);
        assertThat(registrado.getNivel()).isSameAs(nivelInicial);
        assertThat(registrado.getFechaRegistro()).isNotNull();
    }

    @Test
    void rechazaCorreoRepetidoSinGuardarNada() {
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(true);

        assertThatThrownBy(() -> servicio.registrar(CORREO, CONTRASENA))
                .isInstanceOf(UsuarioYaExisteExcepcion.class);

        verify(usuarioRepositorioPuerto, never()).guardar(any());
        verify(cifradorPuerto, never()).cifrar(any());
    }

    @Test
    void fallaSiNoHayNivelesConfigurados() {
        when(usuarioRepositorioPuerto.existePorCorreo(CORREO)).thenReturn(false);
        when(cifradorPuerto.cifrar(CONTRASENA)).thenReturn(CONTRASENA_CIFRADA);
        when(nivelRepositorioPuerto.buscarNivelInicial()).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.registrar(CORREO, CONTRASENA))
                .isInstanceOf(NivelInicialNoConfiguradoExcepcion.class);

        verify(usuarioRepositorioPuerto, never()).guardar(any());
    }
}
