package com.aldia.dominio.modelo;

import java.time.LocalDateTime;

/**
 * Cuenta del portal. Es inmutable: los cambios devuelven una copia (con...).
 * Las cuentas no se borran: se desactivan (activo = false).
 */
public class Usuario {

    private final Long id;
    private final String correo;
    private final String contrasenaCifrada;
    private final Rol rol;
    private final Nivel nivel;
    private final LocalDateTime fechaRegistro;
    private final boolean activo;
    private final String nombre;
    private final Ciudad ciudad;
    private final int puntaje;

    /**
     * Usuario nuevo o activo, sin nombre ni ciudad todavía.
     */
    public Usuario(Long id, String correo, String contrasenaCifrada, Rol rol, Nivel nivel, LocalDateTime fechaRegistro) {
        this(id, correo, contrasenaCifrada, rol, nivel, fechaRegistro, true);
    }

    public Usuario(Long id, String correo, String contrasenaCifrada, Rol rol, Nivel nivel,
                   LocalDateTime fechaRegistro, boolean activo) {
        this(id, correo, contrasenaCifrada, rol, nivel, fechaRegistro, activo, null, null, 0);
    }

    public Usuario(Long id, String correo, String contrasenaCifrada, Rol rol, Nivel nivel,
                   LocalDateTime fechaRegistro, boolean activo, String nombre, Ciudad ciudad, int puntaje) {
        this.id = id;
        this.correo = correo;
        this.contrasenaCifrada = contrasenaCifrada;
        this.rol = rol;
        this.nivel = nivel;
        this.fechaRegistro = fechaRegistro;
        this.activo = activo;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.puntaje = puntaje;
    }

    public Usuario conPuntajeYNivel(int nuevoPuntaje, Nivel nuevoNivel) {
        return new Usuario(id, correo, contrasenaCifrada, rol, nuevoNivel, fechaRegistro, activo,
                nombre, ciudad, Math.max(0, nuevoPuntaje));
    }

    public Usuario conPerfil(String nuevoNombre, Ciudad nuevaCiudad) {
        return new Usuario(id, correo, contrasenaCifrada, rol, nivel, fechaRegistro, activo,
                nuevoNombre, nuevaCiudad, puntaje);
    }

    public Usuario conActivo(boolean nuevoActivo) {
        return new Usuario(id, correo, contrasenaCifrada, rol, nivel, fechaRegistro, nuevoActivo,
                nombre, ciudad, puntaje);
    }

    public Usuario conRol(Rol nuevoRol) {
        return new Usuario(id, correo, contrasenaCifrada, nuevoRol, nivel, fechaRegistro, activo,
                nombre, ciudad, puntaje);
    }

    public boolean esAdministrador() {
        return rol == Rol.ADMINISTRADOR;
    }

    /** Nombre para mostrar: el nombre si lo tiene; si no, la parte del correo antes de la @. */
    public String nombreVisible() {
        if (nombre != null && !nombre.isBlank()) {
            return nombre;
        }
        int arroba = correo == null ? -1 : correo.indexOf('@');
        return arroba > 0 ? correo.substring(0, arroba) : correo;
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

    public String getNombre() {
        return nombre;
    }

    public Ciudad getCiudad() {
        return ciudad;
    }

    public int getPuntaje() {
        return puntaje;
    }

    public enum Rol {
        USUARIO_COMUN,
        ADMINISTRADOR
    }
}
