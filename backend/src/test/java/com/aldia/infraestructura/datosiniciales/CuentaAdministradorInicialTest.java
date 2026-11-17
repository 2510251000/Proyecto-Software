package com.aldia.infraestructura.datosiniciales;

import static com.aldia.dominio.Fixtures.NIVEL_1;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class CuentaAdministradorInicialTest {

    @Mock
    private UsuarioRepositorioPuerto usuarios;
    @Mock
    private NivelRepositorioPuerto niveles;
    @Mock
    private CifradorPuerto cifrador;
    @Captor
    private ArgumentCaptor<Usuario> guardado;

    private CuentaAdministradorInicial cuenta(String correo, String contrasena) {
        return new CuentaAdministradorInicial(usuarios, niveles, cifrador, Clock.systemUTC(), correo, contrasena);
    }

    @Test
    void sinVariablesNoHaceNada() {
        cuenta("", "").run(null);
        cuenta("admin@aldia.com", "").run(null);
        verify(usuarios, never()).guardar(any());
    }

    @Test
    void unaContrasenaCortaNoDejaArrancar() {
        CuentaAdministradorInicial corta = cuenta("admin@aldia.com", "123");
        assertThatThrownBy(() -> corta.run(null)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void siLaCuentaExisteLaVuelveAdministradoraActivaConLaNuevaContrasena() {
        when(cifrador.cifrar("secreta-larga")).thenReturn("hash-nuevo");
        when(usuarios.buscarPorCorreo("admin@aldia.com")).thenReturn(Optional.of(new Usuario(1L,
                "admin@aldia.com", "hash-viejo", Usuario.Rol.USUARIO_COMUN, NIVEL_1, LocalDateTime.now(), false,
                "Admin", null, 40)));

        cuenta(" Admin@Aldia.com ", "secreta-larga").run(null);

        verify(usuarios).guardar(guardado.capture());
        Usuario admin = guardado.getValue();
        assertThat(admin.getId()).isEqualTo(1L);
        assertThat(admin.esAdministrador()).isTrue();
        assertThat(admin.isActivo()).isTrue();
        assertThat(admin.getContrasenaCifrada()).isEqualTo("hash-nuevo");
        assertThat(admin.getPuntaje()).isEqualTo(40);
    }

    @Test
    void siNoExisteLaCrea() {
        when(cifrador.cifrar("secreta-larga")).thenReturn("hash");
        when(usuarios.buscarPorCorreo("admin@aldia.com")).thenReturn(Optional.empty());
        when(niveles.buscarNivelInicial()).thenReturn(Optional.of(NIVEL_1));

        cuenta("admin@aldia.com", "secreta-larga").run(null);

        verify(usuarios).guardar(guardado.capture());
        assertThat(guardado.getValue().getId()).isNull();
        assertThat(guardado.getValue().esAdministrador()).isTrue();
    }
}
