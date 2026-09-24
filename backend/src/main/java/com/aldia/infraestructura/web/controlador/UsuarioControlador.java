package com.aldia.infraestructura.web.controlador;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.ObtenerUsuarioActualCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.UsuarioActualResponseDTO;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/usuarios")
@SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
public class UsuarioControlador {

    private final ObtenerUsuarioActualCasoDeUso obtenerUsuarioActualCasoDeUso;

    public UsuarioControlador(ObtenerUsuarioActualCasoDeUso obtenerUsuarioActualCasoDeUso) {
        this.obtenerUsuarioActualCasoDeUso = obtenerUsuarioActualCasoDeUso;
    }

    /**
     * Devuelve los datos del usuario dueño del token. FiltroJWT deja el correo
     * (el "subject" del token) como nombre de la autenticación.
     */
    @GetMapping("/me")
    public ResponseEntity<UsuarioActualResponseDTO> obtenerUsuarioActual(Authentication autenticacion) {
        Usuario usuario = obtenerUsuarioActualCasoDeUso.obtenerPorCorreo(autenticacion.getName());
        return ResponseEntity.ok(UsuarioActualResponseDTO.desde(usuario));
    }
}