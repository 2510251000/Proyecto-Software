package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class ObtenerUsuarioActualServicioTest {

    private static final String CORREO = "prueba@correo.com";

    @Mock
    private UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    @InjectMocks
    private ObtenerUsuarioActualServicio servicio;

    @Test
    void devuelveElUsuarioDelCorreo() {
        Usuario usuario = new Usuario(1L, CORREO, "hash", Usuario.Rol.USUARIO_COMUN,
                new Nivel(1L, "Básico", 3), LocalDateTime.now());
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.of(usuario));

        assertThat(servicio.obtenerPorCorreo(CORREO)).isSameAs(usuario);
    }

    @Test
    void fallaSiElUsuarioDelTokenYaNoExiste() {
        when(usuarioRepositorioPuerto.buscarPorCorreo(CORREO)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.obtenerPorCorreo(CORREO))
                .isInstanceOf(UsuarioNoEncontradoExcepcion.class);
    }
}
