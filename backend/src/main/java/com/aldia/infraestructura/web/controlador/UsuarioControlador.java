package com.aldia.infraestructura.web.controlador;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.puerto.entrada.ActualizarPerfilCasoDeUso;
import com.aldia.dominio.puerto.entrada.ConsultarPerfilCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.ActualizarPerfilRequestDTO;
import com.aldia.infraestructura.web.dto.PerfilResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
@SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
public class UsuarioControlador {

    private final ConsultarPerfilCasoDeUso consultarPerfilCasoDeUso;
    private final ActualizarPerfilCasoDeUso actualizarPerfilCasoDeUso;

    public UsuarioControlador(ConsultarPerfilCasoDeUso consultarPerfilCasoDeUso,
                              ActualizarPerfilCasoDeUso actualizarPerfilCasoDeUso) {
        this.consultarPerfilCasoDeUso = consultarPerfilCasoDeUso;
        this.actualizarPerfilCasoDeUso = actualizarPerfilCasoDeUso;
    }

    /**
     * Devuelve los datos del usuario dueño del token, con su nivel y el cupo de
     * publicaciones de hoy. FiltroJWT deja el correo (el "subject" del token) como nombre
     * de la autenticación.
     */
    @GetMapping("/me")
    @Operation(summary = "Perfil del usuario de la sesión: nivel, puntaje y cupo de hoy")
    public ResponseEntity<PerfilResponseDTO> obtenerUsuarioActual(Authentication autenticacion) {
        return ResponseEntity.ok(PerfilResponseDTO.desde(consultarPerfilCasoDeUso.consultar(autenticacion.getName())));
    }

    @PutMapping("/me")
    @Operation(summary = "Cambiar el nombre o la ciudad del usuario de la sesión")
    public ResponseEntity<PerfilResponseDTO> actualizar(@Valid @RequestBody ActualizarPerfilRequestDTO solicitud,
                                                        Authentication autenticacion) {
        actualizarPerfilCasoDeUso.actualizar(autenticacion.getName(), solicitud.nombre(), solicitud.ciudadId());
        return ResponseEntity.ok(PerfilResponseDTO.desde(consultarPerfilCasoDeUso.consultar(autenticacion.getName())));
    }
}
