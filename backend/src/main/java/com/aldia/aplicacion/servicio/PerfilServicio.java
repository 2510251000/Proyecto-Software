package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDate;

import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.CupoDiario;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Perfil;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.ActualizarPerfilCasoDeUso;
import com.aldia.dominio.puerto.entrada.ConsultarPerfilCasoDeUso;
import com.aldia.dominio.puerto.salida.CalificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.CalculadoraNivel;
import com.aldia.dominio.servicio.ReglaLimiteDiario;

/**
 * Perfil del usuario de la sesión: nivel, puntos para el siguiente, cupo de hoy, su aprobación
 * como autor y los datos que puede cambiar (nombre y ciudad).
 */
public class PerfilServicio implements ConsultarPerfilCasoDeUso, ActualizarPerfilCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final NivelRepositorioPuerto nivelRepositorioPuerto;
    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;
    private final CiudadRepositorioPuerto ciudadRepositorioPuerto;
    private final CalificacionRepositorioPuerto calificacionRepositorioPuerto;
    private final ReglaLimiteDiario reglaLimiteDiario;
    private final CalculadoraNivel calculadoraNivel;
    private final Clock reloj;

    @SuppressWarnings("java:S107") // Junta varias consultas del perfil: recibe un puerto por cada una.
    public PerfilServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                          NivelRepositorioPuerto nivelRepositorioPuerto,
                          NoticiaRepositorioPuerto noticiaRepositorioPuerto,
                          CiudadRepositorioPuerto ciudadRepositorioPuerto,
                          CalificacionRepositorioPuerto calificacionRepositorioPuerto,
                          ReglaLimiteDiario reglaLimiteDiario,
                          CalculadoraNivel calculadoraNivel,
                          Clock reloj) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.nivelRepositorioPuerto = nivelRepositorioPuerto;
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
        this.ciudadRepositorioPuerto = ciudadRepositorioPuerto;
        this.calificacionRepositorioPuerto = calificacionRepositorioPuerto;
        this.reglaLimiteDiario = reglaLimiteDiario;
        this.calculadoraNivel = calculadoraNivel;
        this.reloj = reloj;
    }

    @Override
    public Perfil consultar(String correo) {
        Usuario usuario = activo(correo);
        long publicadasHoy = noticiaRepositorioPuerto.contarDelAutorDesde(usuario.getId(),
                LocalDate.now(reloj).atStartOfDay());
        CupoDiario cupo = reglaLimiteDiario.cupo(usuario, publicadasHoy);
        Nivel siguiente = calculadoraNivel.siguiente(usuario.getNivel(), nivelRepositorioPuerto.listarTodos())
                .orElse(null);
        return new Perfil(usuario, siguiente, cupo, calificacionRepositorioPuerto.reputacion(usuario.getId()));
    }

    @Override
    public Usuario actualizar(String correo, String nombre, Long ciudadId) {
        Usuario usuario = activo(correo);
        Ciudad ciudad = ciudadId == null
                ? usuario.getCiudad()
                : ciudadRepositorioPuerto.buscarPorId(ciudadId).orElseThrow(CiudadNoEncontradaExcepcion::new);
        String nombreLimpio = nombre == null || nombre.isBlank() ? usuario.getNombre() : nombre.trim();
        return usuarioRepositorioPuerto.guardar(usuario.conPerfil(nombreLimpio, ciudad));
    }

    private Usuario activo(String correo) {
        Usuario usuario = usuarioRepositorioPuerto.buscarPorCorreo(correo)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);
        if (!usuario.isActivo()) {
            throw new CuentaDesactivadaExcepcion();
        }
        return usuario;
    }
}
