package com.aldia.infraestructura.web.controlador;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.IniciarSesionCasoDeUso;
import com.aldia.dominio.puerto.entrada.RegistrarUsuarioCasoDeUso;
import com.aldia.infraestructura.web.dto.LoginRequestDTO;
import com.aldia.infraestructura.web.dto.LoginResponseDTO;
import com.aldia.infraestructura.web.dto.RegistroRequestDTO;
import com.aldia.infraestructura.web.dto.RegistroResponseDTO;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionControlador {

    private final RegistrarUsuarioCasoDeUso registrarUsuarioCasoDeUso;
    private final IniciarSesionCasoDeUso iniciarSesionCasoDeUso;

    public AutenticacionControlador(RegistrarUsuarioCasoDeUso registrarUsuarioCasoDeUso,
                                     IniciarSesionCasoDeUso iniciarSesionCasoDeUso) {
        this.registrarUsuarioCasoDeUso = registrarUsuarioCasoDeUso;
        this.iniciarSesionCasoDeUso = iniciarSesionCasoDeUso;
    }

    @PostMapping("/registro")
    public ResponseEntity<RegistroResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        Usuario usuario = registrarUsuarioCasoDeUso.registrar(request.getCorreo(), request.getContrasena());

        RegistroResponseDTO respuesta = new RegistroResponseDTO(
                usuario.getId(),
                usuario.getCorreo(),
                usuario.getRol().name()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        String token = iniciarSesionCasoDeUso.iniciarSesion(request.getCorreo(), request.getContrasena());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }
}