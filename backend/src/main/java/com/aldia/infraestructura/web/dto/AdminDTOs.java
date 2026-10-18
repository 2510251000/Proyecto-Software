package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Usuario;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTOs del panel de administración (/api/admin).
 */
public final class AdminDTOs {

    private AdminDTOs() {
    }

    public record CambiarEstadoDTO(@NotNull(message = "El estado es obligatorio") Noticia.Estado estado) {
    }

    /** Los campos en null no se cambian. */
    public record ActualizarUsuarioDTO(
            Boolean activo,
            Usuario.Rol rol,
            @Min(value = 1, message = "El nivel va de 1 a 3")
            @Max(value = 3, message = "El nivel va de 1 a 3")
            Integer nivel
    ) {
    }

    public record UsuarioAdminDTO(Long id, String correo, String nombre, String rol, boolean activo,
                                  int nivel, String nivelNombre, int puntaje, String ciudad,
                                  LocalDateTime fechaRegistro) {

        public static UsuarioAdminDTO desde(Usuario usuario) {
            return new UsuarioAdminDTO(usuario.getId(), usuario.getCorreo(), usuario.getNombre(),
                    usuario.getRol().name(), usuario.isActivo(), usuario.getNivel().getNumero(),
                    usuario.getNivel().getNombre(), usuario.getPuntaje(),
                    usuario.getCiudad() != null ? usuario.getCiudad().nombre() : null,
                    usuario.getFechaRegistro());
        }
    }
}
