package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.AlertaNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.Alerta;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.AlertasCasoDeUso;
import com.aldia.dominio.puerto.salida.AlertaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;

/**
 * Alertas de emergencia (desaparición, robo, emergencia). Se crean al publicar la noticia
 * (PublicarNoticiaServicio); aquí se consultan y se dan por terminadas.
 */
public class AlertasServicio implements AlertasCasoDeUso {

    private final AlertaRepositorioPuerto alertaRepositorioPuerto;
    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final NotificacionRepositorioPuerto notificacionRepositorioPuerto;
    private final EjecutorTransaccionalPuerto transaccion;
    private final AvisosPorCiudad avisosPorCiudad;
    private final Clock reloj;
    private final int horasVigencia;

    @SuppressWarnings("java:S107") // Caso de uso que orquesta varias reglas: recibe un puerto por cada una.
    public AlertasServicio(AlertaRepositorioPuerto alertaRepositorioPuerto,
                           UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                           NotificacionRepositorioPuerto notificacionRepositorioPuerto,
                           EjecutorTransaccionalPuerto transaccion,
                           AvisosPorCiudad avisosPorCiudad,
                           Clock reloj,
                           int horasVigencia) {
        this.alertaRepositorioPuerto = alertaRepositorioPuerto;
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.notificacionRepositorioPuerto = notificacionRepositorioPuerto;
        this.transaccion = transaccion;
        this.avisosPorCiudad = avisosPorCiudad;
        this.reloj = reloj;
        this.horasVigencia = horasVigencia;
    }

    @Override
    public List<Alerta> vigentes(String correo, Long ciudadId) {
        Long ciudad = ciudadId;
        if (ciudad == null) {
            Usuario usuario = usuario(correo);
            ciudad = usuario.getCiudad() != null ? usuario.getCiudad().id() : null;
        }
        return alertaRepositorioPuerto.activasDesde(ciudad, ahora().minusHours(horasVigencia));
    }

    @Override
    public List<Alerta.Pendiente> pendientes(String correo) {
        List<Notificacion> sinLeer = notificacionRepositorioPuerto.listarNoLeidasDeTipo(usuario(correo).getId(),
                TipoNotificacion.ALERTA);
        if (sinLeer.isEmpty()) {
            return List.of();
        }
        Map<Long, Alerta> porNoticia = alertaRepositorioPuerto.buscarTodas(
                        sinLeer.stream().map(Notificacion::noticiaId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Alerta::noticiaId, Function.identity()));
        LocalDateTime ahora = ahora();
        return sinLeer.stream()
                .filter(notificacion -> porNoticia.containsKey(notificacion.noticiaId()))
                .map(notificacion -> new Alerta.Pendiente(notificacion.id(), porNoticia.get(notificacion.noticiaId())))
                .filter(pendiente -> pendiente.alerta().vigente(ahora, horasVigencia))
                .toList();
    }

    @Override
    public Alerta deNoticia(Long noticiaId) {
        return alertaRepositorioPuerto.buscar(noticiaId).orElseThrow(AlertaNoEncontradaExcepcion::new);
    }

    @Override
    public Alerta resolver(String correo, Long noticiaId) {
        return transaccion.ejecutar(() -> {
            Usuario usuario = usuario(correo);
            Alerta alerta = deNoticia(noticiaId);
            if (!usuario.esAdministrador() && !usuario.getId().equals(alerta.autorId())) {
                throw new AccionNoPermitidaExcepcion("Solo quien publicó la alerta o un administrador puede resolverla");
            }
            if (!alerta.activa()) {
                return alerta;
            }
            LocalDateTime ahora = ahora();
            alertaRepositorioPuerto.resolver(noticiaId, ahora);
            notificacionRepositorioPuerto.guardarTodas(avisosPorCiudad.paraAlertaResuelta(alerta,
                    usuarioRepositorioPuerto.idsActivosEnCiudad(alerta.ciudadId()), ahora));
            return deNoticia(noticiaId);
        });
    }

    private Usuario usuario(String correo) {
        return usuarioRepositorioPuerto.buscarPorCorreo(correo).orElseThrow(UsuarioNoEncontradoExcepcion::new);
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(reloj);
    }
}
