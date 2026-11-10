package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.CalificacionPropia;
import com.aldia.dominio.modelo.Comentario;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Reporte;

import jakarta.validation.constraints.NotNull;

/** DTOs de comentarios, votos al autor y reportes. */
public final class InteraccionDTOs {

    private InteraccionDTOs() {
    }

    /** El largo y que no esté vacío los revisa el dominio, con su mensaje. */
    public record NuevoComentarioDTO(String contenido) {
    }

    public record ComentarioDTO(Long id, String contenido, LocalDateTime fecha, Long autorId, String autor,
                                int autorNivel) {

        public static ComentarioDTO desde(Comentario comentario) {
            return new ComentarioDTO(comentario.id(), comentario.contenido(), comentario.fecha(), comentario.usuarioId(),
                    comentario.autorNombre(), comentario.autorNivel());
        }
    }

    /** true: «sigue publicando así»; false: «no me gustó esto». */
    public record CalificarDTO(@NotNull(message = "Elige si el autor debe seguir publicando así o no")
                               Boolean recomienda) {
    }

    /** La reputación nueva del autor (aprobación null si no tiene votos) y el voto del usuario. */
    public record CalificacionDTO(Integer autorAprobacion, long autorVotos, long autorVotosPositivos,
                                  boolean miVoto) {

        public static CalificacionDTO desde(CalificacionPropia calificacion) {
            return new CalificacionDTO(calificacion.reputacion().aprobacion(), calificacion.reputacion().votos(),
                    calificacion.reputacion().positivos(), calificacion.recomienda());
        }
    }

    public record NuevoReporteDTO(@NotNull(message = "Elige el motivo del reporte") MotivoReporte motivo,
                                  String descripcion) {
    }

    public record CambiarEstadoReporteDTO(@NotNull(message = "El estado es obligatorio") EstadoReporte estado) {
    }

    public record ReporteDTO(Long id, Long noticiaId, String noticiaTitulo, String noticiaEstado, Long usuarioId,
                             String usuario, MotivoReporte motivo, String descripcion, EstadoReporte estado,
                             LocalDateTime fecha) {

        public static ReporteDTO desde(Reporte reporte) {
            return new ReporteDTO(reporte.id(), reporte.noticiaId(), reporte.noticiaTitulo(),
                    reporte.noticiaEstado().name(), reporte.usuarioId(), reporte.usuarioNombre(), reporte.motivo(),
                    reporte.descripcion(), reporte.estado(), reporte.fecha());
        }
    }
}
