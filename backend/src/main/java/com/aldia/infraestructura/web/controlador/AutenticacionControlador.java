package com.aldia.infraestructura.web.controlador;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.modelo.NuevoUsuario;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.IniciarSesionCasoDeUso;
import com.aldia.dominio.puerto.entrada.IniciarSesionExternaCasoDeUso;
import com.aldia.dominio.puerto.entrada.RegistrarUsuarioCasoDeUso;
import com.aldia.infraestructura.web.dto.LoginExternoRequestDTO;
import com.aldia.infraestructura.web.dto.LoginRequestDTO;
import com.aldia.infraestructura.web.dto.LoginResponseDTO;
import com.aldia.infraestructura.web.dto.RegistroRequestDTO;
import com.aldia.infraestructura.web.dto.RegistroResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionControlador {

    private final RegistrarUsuarioCasoDeUso registrarUsuarioCasoDeUso;
    private final IniciarSesionCasoDeUso iniciarSesionCasoDeUso;
    private final IniciarSesionExternaCasoDeUso iniciarSesionExternaCasoDeUso;

    public AutenticacionControlador(RegistrarUsuarioCasoDeUso registrarUsuarioCasoDeUso,
                                     IniciarSesionCasoDeUso iniciarSesionCasoDeUso,
                                     IniciarSesionExternaCasoDeUso iniciarSesionExternaCasoDeUso) {
        this.registrarUsuarioCasoDeUso = registrarUsuarioCasoDeUso;
        this.iniciarSesionCasoDeUso = iniciarSesionCasoDeUso;
        this.iniciarSesionExternaCasoDeUso = iniciarSesionExternaCasoDeUso;
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar un usuario común (nivel 1) con su ciudad")
    public ResponseEntity<RegistroResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        Usuario usuario = registrarUsuarioCasoDeUso.registrar(new NuevoUsuario(
                request.getCorreo(), request.getContrasena(), request.getNombre(), request.getCiudadId()));

        RegistroResponseDTO respuesta = new RegistroResponseDTO(
                usuario.getId(),
                usuario.getCorreo(),
                usuario.getRol().name()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y recibir el token JWT")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        String token = iniciarSesionCasoDeUso.iniciarSesion(request.getCorreo(), request.getContrasena());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/google")
    @Operation(summary = "Iniciar sesión con Google (token de Firebase Authentication); crea la cuenta si no existe")
    public ResponseEntity<LoginResponseDTO> loginConGoogle(@Valid @RequestBody LoginExternoRequestDTO request) {
        return ResponseEntity.ok(new LoginResponseDTO(iniciarSesionExternaCasoDeUso.iniciarSesion(request.token())));
    }
}
