package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.CupoDiario;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Perfil;
import com.aldia.dominio.modelo.Usuario;

/**
 * Respuesta de GET /api/usuarios/me. Conserva los campos que ya existían
 * (id, correo, rol, nivel como nombre, fechaRegistro) y agrega los del perfil.
 */
public record PerfilResponseDTO(
        Long id,
        String correo,
        String nombre,
        String rol,
        String nivel,
        int nivelNumero,
        int puntaje,
        NivelDTO siguienteNivel,
        CiudadResponseDTO ciudad,
        CupoDTO cupo,
        LocalDateTime fechaRegistro
) {

    public record NivelDTO(int numero, String nombre, int puntajeMinimo, int limiteNoticiasDiarias) {

        static NivelDTO desde(Nivel nivel) {
            return nivel == null ? null : new NivelDTO(nivel.getNumero(), nivel.getNombre(),
                    nivel.getPuntajeMinimo(), nivel.getLimiteNoticiasDiarias());
        }
    }

    /** restantes es null cuando el cupo es ilimitado (administradores). */
    public record CupoDTO(int limite, long publicadasHoy, Long restantes, boolean ilimitado) {

        static CupoDTO desde(CupoDiario cupo) {
            return new CupoDTO(cupo.limite(), cupo.publicadasHoy(), cupo.ilimitado() ? null : cupo.restantes(),
                    cupo.ilimitado());
        }
    }

    public static PerfilResponseDTO desde(Perfil perfil) {
        Usuario usuario = perfil.usuario();
        return new PerfilResponseDTO(
                usuario.getId(),
                usuario.getCorreo(),
                usuario.getNombre(),
                usuario.getRol().name(),
                usuario.getNivel().getNombre(),
                usuario.getNivel().getNumero(),
                usuario.getPuntaje(),
                NivelDTO.desde(perfil.siguienteNivel()),
                CiudadResponseDTO.desde(usuario.getCiudad()),
                CupoDTO.desde(perfil.cupo()),
                usuario.getFechaRegistro()
        );
    }
}
