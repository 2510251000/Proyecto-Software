package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

public class Usuario {

    private Long id;
    private String correo;
    private String contrasenaCifrada;
    private Rol rol;
    private Nivel nivel;
    private LocalDateTime fechaRegistro;
    private boolean activo;

    /**
     * Usuario nuevo o activo. Las cuentas no se borran: se desactivan (activo = false).
     */
    public Usuario(Long id, String correo, String contrasenaCifrada, Rol rol, Nivel nivel, LocalDateTime fechaRegistro) {
        this(id, correo, contrasenaCifrada, rol, nivel, fechaRegistro, true);
    }

    public Usuario(Long id, String correo, String contrasenaCifrada, Rol rol, Nivel nivel,
                   LocalDateTime fechaRegistro, boolean activo) {
        this.id = id;
        this.correo = correo;
        this.contrasenaCifrada = contrasenaCifrada;
        this.rol = rol;
        this.nivel = nivel;
        this.fechaRegistro = fechaRegistro;
        this.activo = activo;
    }

    public Long getId() {
        return id;
    }

    public String getCorreo() {
        return correo;
    }

    public String getContrasenaCifrada() {
        return contrasenaCifrada;
    }

    public Rol getRol() {
        return rol;
    }

    public Nivel getNivel() {
        return nivel;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public boolean isActivo() {
        return activo;
    }

    public enum Rol {
        USUARIO_COMUN,
        ADMINISTRADOR
    }
}
