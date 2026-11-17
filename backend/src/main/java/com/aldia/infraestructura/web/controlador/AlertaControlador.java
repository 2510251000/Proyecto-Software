package com.aldia.infraestructura.web.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.puerto.entrada.AlertasCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.AlertaResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

/**
 * Alertas de emergencia (desaparición, robo, emergencia). Se crean publicando una noticia
 * con el campo «alerta»; aquí se consultan y se resuelven.
 */
@RestController
@RequestMapping("/api/alertas")
@SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
public class AlertaControlador {

    private final AlertasCasoDeUso alertasCasoDeUso;

    public AlertaControlador(AlertasCasoDeUso alertasCasoDeUso) {
        this.alertasCasoDeUso = alertasCasoDeUso;
    }

    @GetMapping
    @Operation(summary = "Alertas vigentes de una ciudad (por defecto, la del usuario)")
    public ResponseEntity<List<AlertaResponseDTO>> vigentes(
            @Parameter(description = "Ciudad; si no se manda, la del usuario de la sesión")
            @RequestParam(required = false) Long ciudadId,
            Authentication autenticacion) {
        return ResponseEntity.ok(alertasCasoDeUso.vigentes(autenticacion.getName(), ciudadId).stream()
                .map(AlertaResponseDTO::desde)
                .toList());
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Alertas que el usuario aún no ha visto: la app las muestra a pantalla completa")
    public ResponseEntity<List<AlertaResponseDTO.PendienteDTO>> pendientes(Authentication autenticacion) {
        return ResponseEntity.ok(alertasCasoDeUso.pendientes(autenticacion.getName()).stream()
                .map(AlertaResponseDTO.PendienteDTO::desde)
                .toList());
    }

    @GetMapping("/{noticiaId}")
    @Operation(summary = "La alerta de una noticia (404 si la noticia no es una alerta)")
    public ResponseEntity<AlertaResponseDTO> deNoticia(@PathVariable Long noticiaId) {
        return ResponseEntity.ok(AlertaResponseDTO.desde(alertasCasoDeUso.deNoticia(noticiaId)));
    }

    @PutMapping("/{noticiaId}/resuelta")
    @Operation(summary = "Dar la alerta por terminada (solo el autor o un administrador)")
    public ResponseEntity<AlertaResponseDTO> resolver(@PathVariable Long noticiaId, Authentication autenticacion) {
        return ResponseEntity.ok(AlertaResponseDTO.desde(
                alertasCasoDeUso.resolver(autenticacion.getName(), noticiaId)));
    }
}
