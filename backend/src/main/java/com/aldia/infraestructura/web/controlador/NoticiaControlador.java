package com.aldia.infraestructura.web.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.puerto.entrada.ListarNoticiasCasoDeUso;
import com.aldia.infraestructura.web.dto.NoticiaRespuestaDto;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaControlador {

    private final ListarNoticiasCasoDeUso listarNoticiasCasoDeUso;

    public NoticiaControlador(ListarNoticiasCasoDeUso listarNoticiasCasoDeUso) {
        this.listarNoticiasCasoDeUso = listarNoticiasCasoDeUso;
    }

    @GetMapping
    public ResponseEntity<List<NoticiaRespuestaDto>> listar() {
        List<NoticiaRespuestaDto> noticias = listarNoticiasCasoDeUso.listarPublicadas()
                .stream()
                .map(NoticiaRespuestaDto::desde)
                .toList();
        return ResponseEntity.ok(noticias);
    }
}
