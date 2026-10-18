package com.aldia.infraestructura.web.controlador;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.ListarNoticiasCasoDeUso;
import com.aldia.dominio.puerto.entrada.ObtenerNoticiaCasoDeUso;
import com.aldia.dominio.puerto.entrada.PublicarNoticiaCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.NoticiaResponseDTO;
import com.aldia.infraestructura.web.dto.PublicarNoticiaRequestDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaControlador {

    private final ListarNoticiasCasoDeUso listarNoticiasCasoDeUso;
    private final ObtenerNoticiaCasoDeUso obtenerNoticiaCasoDeUso;
    private final PublicarNoticiaCasoDeUso publicarNoticiaCasoDeUso;

    public NoticiaControlador(ListarNoticiasCasoDeUso listarNoticiasCasoDeUso,
                              ObtenerNoticiaCasoDeUso obtenerNoticiaCasoDeUso,
                              PublicarNoticiaCasoDeUso publicarNoticiaCasoDeUso) {
        this.listarNoticiasCasoDeUso = listarNoticiasCasoDeUso;
        this.obtenerNoticiaCasoDeUso = obtenerNoticiaCasoDeUso;
        this.publicarNoticiaCasoDeUso = publicarNoticiaCasoDeUso;
    }

    @GetMapping
    @Operation(summary = "Listar noticias publicadas, de la más reciente a la más antigua")
    public ResponseEntity<List<NoticiaResponseDTO>> listar() {
        List<NoticiaResponseDTO> noticias = listarNoticiasCasoDeUso.listarPublicadas()
                .stream()
                .map(NoticiaResponseDTO::desde)
                .toList();
        return ResponseEntity.ok(noticias);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver una noticia publicada (404 si no existe, está oculta o eliminada)")
    public ResponseEntity<NoticiaResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(NoticiaResponseDTO.desde(obtenerNoticiaCasoDeUso.obtenerPublicada(id)));
    }

    @PostMapping
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Publicar una noticia (respeta el límite diario del nivel del autor)")
    public ResponseEntity<NoticiaResponseDTO> publicar(@Valid @RequestBody PublicarNoticiaRequestDTO solicitud,
                                                       Authentication autenticacion) {
        Noticia publicada = publicarNoticiaCasoDeUso.publicar(autenticacion.getName(), solicitud.aDominio());

        URI ubicacion = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(publicada.getId())
                .toUri();

        return ResponseEntity.created(ubicacion).body(NoticiaResponseDTO.desde(publicada));
    }
}
