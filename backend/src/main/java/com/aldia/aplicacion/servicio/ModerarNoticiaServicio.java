package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.ModerarNoticiaCasoDeUso;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;
import com.aldia.dominio.servicio.CalculadoraNivel;

/**
 * Moderación del administrador: ocultar, volver a publicar o borrar noticias.
 * Borrar es lógico (estado ELIMINADA) y no tiene vuelta atrás. Al autor de una noticia
 * comunitaria moderada se le avisa y se le restan puntos; si se vuelve a publicar, se le devuelven.
 */
public class ModerarNoticiaServicio implements ModerarNoticiaCasoDeUso {

    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;
    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final NivelRepositorioPuerto nivelRepositorioPuerto;
    private final NotificacionRepositorioPuerto notificacionRepositorioPuerto;
    private final HistorialRepositorioPuerto historialRepositorioPuerto;
    private final EjecutorTransaccionalPuerto transaccion;
    private final CalculadoraNivel calculadoraNivel;
    private final Clock reloj;
    private final int maximoListado;

    public ModerarNoticiaServicio(NoticiaRepositorioPuerto noticiaRepositorioPuerto,
                                  UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                  NivelRepositorioPuerto nivelRepositorioPuerto,
                                  NotificacionRepositorioPuerto notificacionRepositorioPuerto,
                                  HistorialRepositorioPuerto historialRepositorioPuerto,
                                  EjecutorTransaccionalPuerto transaccion,
                                  CalculadoraNivel calculadoraNivel,
                                  Clock reloj,
                                  int maximoListado) {
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.nivelRepositorioPuerto = nivelRepositorioPuerto;
        this.notificacionRepositorioPuerto = notificacionRepositorioPuerto;
        this.historialRepositorioPuerto = historialRepositorioPuerto;
        this.transaccion = transaccion;
        this.calculadoraNivel = calculadoraNivel;
        this.reloj = reloj;
        this.maximoListado = maximoListado;
    }

    @Override
    public List<Noticia> listar(Noticia.Estado estado, Boolean oficial) {
        return noticiaRepositorioPuerto.buscarParaModeracion(estado, oficial, maximoListado);
    }

    @Override
    public Noticia cambiarEstado(String correoAdministrador, Long noticiaId, Noticia.Estado nuevoEstado) {
        return transaccion.ejecutar(() -> cambiar(correoAdministrador, noticiaId, nuevoEstado));
    }

    private Noticia cambiar(String correoAdministrador, Long noticiaId, Noticia.Estado nuevoEstado) {
        Usuario administrador = usuarioRepositorioPuerto.buscarPorCorreo(correoAdministrador)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);
        if (!administrador.esAdministrador()) {
            throw new AccionNoPermitidaExcepcion("Solo un administrador puede moderar noticias");
        }

        Noticia noticia = noticiaRepositorioPuerto.buscarPorId(noticiaId)
                .orElseThrow(NoticiaNoEncontradaExcepcion::new);
        Noticia.Estado anterior = noticia.getEstado();

        if (anterior == nuevoEstado) {
            return noticia;
        }
        if (anterior == Noticia.Estado.ELIMINADA) {
            throw new AccionNoPermitidaExcepcion("La noticia ya fue borrada y no se puede recuperar");
        }

        noticiaRepositorioPuerto.cambiarEstado(noticiaId, nuevoEstado);
        LocalDateTime ahora = LocalDateTime.now(reloj);
        historialRepositorioPuerto.registrar(administrador.getId(), AccionHistorial.MODERACION,
                "Noticia " + noticiaId + ": " + anterior + " → " + nuevoEstado, ahora);

        if (!noticia.isOficial() && noticia.getAutorId() != null) {
            ajustarAutor(noticia, anterior, nuevoEstado, ahora);
        }

        return noticiaRepositorioPuerto.buscarPorId(noticiaId).orElseThrow(NoticiaNoEncontradaExcepcion::new);
    }

    private void ajustarAutor(Noticia noticia, Noticia.Estado anterior, Noticia.Estado nuevo, LocalDateTime ahora) {
        Usuario autor = usuarioRepositorioPuerto.buscarPorId(noticia.getAutorId()).orElse(null);
        if (autor == null) {
            return;
        }

        boolean retirada = anterior == Noticia.Estado.PUBLICADA;
        boolean restaurada = nuevo == Noticia.Estado.PUBLICADA;
        if (retirada) {
            usuarioRepositorioPuerto.guardar(calculadoraNivel.restarModeracion(autor, nivelRepositorioPuerto.listarTodos()));
        } else if (restaurada) {
            usuarioRepositorioPuerto.guardar(calculadoraNivel.devolverModeracion(autor, nivelRepositorioPuerto.listarTodos()));
        }

        String accion = switch (nuevo) {
            case OCULTA -> "fue ocultada por un administrador";
            case ELIMINADA -> "fue borrada por un administrador";
            case PUBLICADA -> "volvió a estar publicada";
        };
        notificacionRepositorioPuerto.guardarTodas(List.of(Notificacion.nueva(autor.getId(),
                TipoNotificacion.MODERACION,
                AvisosPorCiudad.recortar("Tu noticia «" + noticia.getTitulo() + "» " + accion + "."),
                nuevo == Noticia.Estado.PUBLICADA ? noticia.getId() : null,
                ahora)));
    }
}
