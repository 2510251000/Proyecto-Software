package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.Usuario;

public class UsuarioActualResponseDTO {

    private Long id;
    private String correo;
    private String rol;
    private String nivel;
    private LocalDateTime fechaRegistro;

    public UsuarioActualResponseDTO(Long id, String correo, String rol, String nivel,
                                    LocalDateTime fechaRegistro) {
        this.id = id;
        this.correo = correo;
        this.rol = rol;
        this.nivel = nivel;
        this.fechaRegistro = fechaRegistro;
    }

    public static UsuarioActualResponseDTO desde(Usuario usuario) {
        String nivel = usuario.getNivel() != null ? usuario.getNivel().getNombre() : null;
        return new UsuarioActualResponseDTO(
                usuario.getId(),
                usuario.getCorreo(),
                usuario.getRol().name(),
                nivel,
                usuario.getFechaRegistro()
        );
    }

    public Long getId() {
        return id;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }

    public String getNivel() {
        return nivel;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
}
