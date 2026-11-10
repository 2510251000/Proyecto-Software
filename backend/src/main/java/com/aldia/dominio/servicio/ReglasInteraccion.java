package com.aldia.dominio.servicio;

import java.time.LocalDateTime;
import java.util.Optional;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.ParametrosInteraccion;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;

/**
 * Reglas de comentar, votar al autor y reportar (HU MF03_001, MF03_002 y MF03_003), y los avisos
 * que recibe el autor de la noticia.
 */
public class ReglasInteraccion {

    private final ParametrosInteraccion parametros;

    public ReglasInteraccion(ParametrosInteraccion parametros) {
        this.parametros = parametros;
    }

    public ParametrosInteraccion parametros() {
        return parametros;
    }

    /** El comentario sin espacios sobrantes; entre 1 y el largo máximo. */
    public String comentarioValido(String contenido) {
        String limpio = contenido == null ? "" : contenido.strip();
        if (limpio.isEmpty()) {
            throw new DatosInvalidosExcepcion("Escribe un comentario");
        }
        if (limpio.length() > parametros.largoMaximoComentario()) {
            throw new DatosInvalidosExcepcion("El comentario puede tener máximo "
                    + parametros.largoMaximoComentario() + " caracteres");
        }
        return limpio;
    }

    /** Borra el autor del comentario o un administrador. */
    public void verificarPuedeBorrarComentario(Usuario quien, Long autorComentarioId) {
        if (!quien.esAdministrador() && !quien.getId().equals(autorComentarioId)) {
            throw new AccionNoPermitidaExcepcion("Solo puedes borrar tus propios comentarios");
        }
    }

    /** El voto dice sí o no, y nadie se vota a sí mismo. */
    public void verificarCalificacion(Usuario quien, Noticia noticia, Boolean recomienda) {
        if (recomienda == null) {
            throw new DatosInvalidosExcepcion("Elige si el autor debe seguir publicando así o no");
        }
        if (quien.getId().equals(noticia.getAutorId())) {
            throw new AccionNoPermitidaExcepcion("No puedes calificarte a ti mismo");
        }
    }

    /** Descripción opcional del reporte, sin pasar del largo máximo. */
    public String descripcionReporte(String descripcion) {
        if (descripcion == null || descripcion.isBlank()) {
            return null;
        }
        String limpia = descripcion.strip();
        if (limpia.length() > parametros.largoMaximoDescripcionReporte()) {
            throw new DatosInvalidosExcepcion("La descripción del reporte puede tener máximo "
                    + parametros.largoMaximoDescripcionReporte() + " caracteres");
        }
        return limpia;
    }

    /** El administrador marca un reporte como revisado o descartado; no se devuelve a pendiente. */
    public void verificarCambioReporte(EstadoReporte nuevo) {
        if (nuevo == null || nuevo == EstadoReporte.PENDIENTE) {
            throw new DatosInvalidosExcepcion("Un reporte se marca como REVISADO o DESCARTADO");
        }
    }

    /** Aviso al autor de que comentaron su noticia; nada si el que comenta es el mismo autor. */
    public Optional<Notificacion> avisoComentario(Noticia noticia, Usuario quien, LocalDateTime fecha) {
        if (noticia.getAutorId() == null || noticia.getAutorId().equals(quien.getId())) {
            return Optional.empty();
        }
        return Optional.of(Notificacion.nueva(noticia.getAutorId(), TipoNotificacion.COMENTARIO,
                quien.nombreVisible() + " comentó tu noticia «" + noticia.getTitulo() + "»", noticia.getId(), fecha));
    }

    /** Aviso al autor de lo que opinó un lector sobre lo que publicó. */
    public Optional<Notificacion> avisoCalificacion(Noticia noticia, Usuario quien, boolean recomienda,
                                                    LocalDateTime fecha) {
        if (noticia.getAutorId() == null) {
            return Optional.empty();
        }
        String mensaje = recomienda
                ? quien.nombreVisible() + " quiere que sigas publicando así por «" + noticia.getTitulo() + "»"
                : "A " + quien.nombreVisible() + " no le gustó que publicaras «" + noticia.getTitulo() + "»";
        return Optional.of(Notificacion.nueva(noticia.getAutorId(), TipoNotificacion.CALIFICACION, mensaje,
                noticia.getId(), fecha));
    }
}
