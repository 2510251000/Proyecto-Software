package com.aldia.infraestructura.web.controlador;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.aldia.dominio.modelo.Comentario;
import com.aldia.dominio.modelo.Reporte;
import com.aldia.dominio.puerto.entrada.CalificarNoticiaCasoDeUso;
import com.aldia.dominio.puerto.entrada.ComentariosCasoDeUso;
import com.aldia.dominio.puerto.entrada.ReportesCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.InteraccionDTOs.CalificacionDTO;
import com.aldia.infraestructura.web.dto.InteraccionDTOs.CalificarDTO;
import com.aldia.infraestructura.web.dto.InteraccionDTOs.ComentarioDTO;
import com.aldia.infraestructura.web.dto.InteraccionDTOs.NuevoComentarioDTO;
import com.aldia.infraestructura.web.dto.InteraccionDTOs.NuevoReporteDTO;
import com.aldia.infraestructura.web.dto.InteraccionDTOs.ReporteDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

/** Comentarios, votos al autor y reportes de una noticia (HU MF03_001 a MF03_003). */
@RestController
@RequestMapping("/api/noticias/{noticiaId}")
public class InteraccionControlador {

    private final ComentariosCasoDeUso comentarios;
    private final CalificarNoticiaCasoDeUso calificaciones;
    private final ReportesCasoDeUso reportes;

    public InteraccionControlador(ComentariosCasoDeUso comentarios, CalificarNoticiaCasoDeUso calificaciones,
                                  ReportesCasoDeUso reportes) {
        this.comentarios = comentarios;
        this.calificaciones = calificaciones;
        this.reportes = reportes;
    }

    @GetMapping("/comentarios")
    @Operation(summary = "Comentarios de una noticia publicada, del más antiguo al más reciente (público)")
    public ResponseEntity<List<ComentarioDTO>> comentarios(@PathVariable Long noticiaId) {
        return ResponseEntity.ok(comentarios.listar(noticiaId).stream().map(ComentarioDTO::desde).toList());
    }

    @PostMapping("/comentarios")
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Comentar una noticia (de 1 a 1000 caracteres); avisa al autor")
    public ResponseEntity<ComentarioDTO> comentar(@PathVariable Long noticiaId,
                                                  @RequestBody NuevoComentarioDTO solicitud,
                                                  Authentication autenticacion) {
        Comentario nuevo = comentarios.comentar(autenticacion.getName(), noticiaId, solicitud.contenido());
        URI ubicacion = ServletUriComponentsBuilder.fromCurrentRequestUri().path("/{id}")
                .buildAndExpand(nuevo.id()).toUri();
        return ResponseEntity.created(ubicacion).body(ComentarioDTO.desde(nuevo));
    }

    @DeleteMapping("/comentarios/{comentarioId}")
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Borrar un comentario (su autor o un administrador)")
    public ResponseEntity<Void> borrarComentario(@PathVariable Long noticiaId, @PathVariable Long comentarioId,
                                                 Authentication autenticacion) {
        comentarios.borrar(autenticacion.getName(), noticiaId, comentarioId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/calificacion")
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Votar al autor: recomienda true (sigue publicando así) o false (no me gustó). "
            + "Un voto por usuario y noticia; si ya votó, se cambia. No sobre la noticia propia")
    public ResponseEntity<CalificacionDTO> calificar(@PathVariable Long noticiaId,
                                                     @Valid @RequestBody CalificarDTO solicitud,
                                                     Authentication autenticacion) {
        return ResponseEntity.ok(CalificacionDTO.desde(
                calificaciones.calificar(autenticacion.getName(), noticiaId, solicitud.recomienda())));
    }

    @PostMapping("/reportes")
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Reportar una noticia (una vez por usuario; repetir responde 409)")
    public ResponseEntity<ReporteDTO> reportar(@PathVariable Long noticiaId,
                                               @Valid @RequestBody NuevoReporteDTO solicitud,
                                               Authentication autenticacion) {
        Reporte reporte = reportes.reportar(autenticacion.getName(), noticiaId, solicitud.motivo(),
                solicitud.descripcion());
        return ResponseEntity.status(201).body(ReporteDTO.desde(reporte));
    }
}
