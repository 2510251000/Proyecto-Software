package com.aldia.aplicacion.servicio;

import java.util.List;

import com.aldia.dominio.excepcion.NotificacionNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.puerto.entrada.NotificacionesCasoDeUso;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

/**
 * Bandeja de notificaciones del usuario de la sesión. Cada quien solo ve y marca las suyas.
 */
public class NotificacionesServicio implements NotificacionesCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final NotificacionRepositorioPuerto notificacionRepositorioPuerto;
    private final int maximoListado;

    public NotificacionesServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                  NotificacionRepositorioPuerto notificacionRepositorioPuerto,
                                  int maximoListado) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.notificacionRepositorioPuerto = notificacionRepositorioPuerto;
        this.maximoListado = maximoListado;
    }

    @Override
    public List<Notificacion> listar(String correo) {
        return notificacionRepositorioPuerto.listarDelUsuario(idDe(correo), maximoListado);
    }

    @Override
    public long contarNoLeidas(String correo) {
        return notificacionRepositorioPuerto.contarNoLeidas(idDe(correo));
    }

    @Override
    public void marcarLeida(String correo, Long notificacionId) {
        if (!notificacionRepositorioPuerto.marcarLeida(notificacionId, idDe(correo))) {
            throw new NotificacionNoEncontradaExcepcion();
        }
    }

    @Override
    public void marcarTodasLeidas(String correo) {
        notificacionRepositorioPuerto.marcarTodasLeidas(idDe(correo));
    }

    private Long idDe(String correo) {
        return usuarioRepositorioPuerto.buscarPorCorreo(correo)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new)
                .getId();
    }
}
