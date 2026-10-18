package com.aldia.infraestructura.web.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.puerto.entrada.NotificacionesCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.NotificacionResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/notificaciones")
@SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
public class NotificacionControlador {

    private final NotificacionesCasoDeUso notificacionesCasoDeUso;

    public NotificacionControlador(NotificacionesCasoDeUso notificacionesCasoDeUso) {
        this.notificacionesCasoDeUso = notificacionesCasoDeUso;
    }

    @GetMapping
    @Operation(summary = "Notificaciones del usuario de la sesión, las más recientes primero")
    public ResponseEntity<List<NotificacionResponseDTO>> listar(Authentication autenticacion) {
        return ResponseEntity.ok(notificacionesCasoDeUso.listar(autenticacion.getName()).stream()
                .map(NotificacionResponseDTO::desde)
                .toList());
    }

    @GetMapping("/no-leidas")
    @Operation(summary = "Cuántas notificaciones sin leer tiene el usuario (para la campana)")
    public ResponseEntity<NotificacionResponseDTO.ConteoDTO> contarNoLeidas(Authentication autenticacion) {
        return ResponseEntity.ok(new NotificacionResponseDTO.ConteoDTO(
                notificacionesCasoDeUso.contarNoLeidas(autenticacion.getName())));
    }

    @PutMapping("/{id}/leida")
    @Operation(summary = "Marcar una notificación como leída")
    public ResponseEntity<Void> marcarLeida(@PathVariable Long id, Authentication autenticacion) {
        notificacionesCasoDeUso.marcarLeida(autenticacion.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/leidas")
    @Operation(summary = "Marcar todas como leídas")
    public ResponseEntity<Void> marcarTodasLeidas(Authentication autenticacion) {
        notificacionesCasoDeUso.marcarTodasLeidas(autenticacion.getName());
        return ResponseEntity.noContent().build();
    }
}
