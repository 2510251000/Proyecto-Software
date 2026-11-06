package com.aldia.infraestructura.web.dto;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.CalificacionPropia;
import com.aldia.dominio.modelo.Comentario;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Reporte;

import jakarta.validation.constraints.NotNull;

/** DTOs de comentarios, calificaciones y reportes. */
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

    public record CalificarDTO(@NotNull(message = "La calificación es obligatoria") Integer valor) {
    }

    public record CalificacionDTO(double promedio, long cantidadCalificaciones, int miCalificacion) {

        public static CalificacionDTO desde(CalificacionPropia calificacion) {
            return new CalificacionDTO(calificacion.resumen().promedio(), calificacion.resumen().cantidad(),
                    calificacion.miCalificacion());
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
