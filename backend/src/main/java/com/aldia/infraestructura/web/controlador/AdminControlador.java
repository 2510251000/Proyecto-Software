package com.aldia.infraestructura.web.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.modelo.CambiosUsuario;
import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.GestionarUsuariosCasoDeUso;
import com.aldia.dominio.puerto.entrada.ModerarNoticiaCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.AdminDTOs.ActualizarUsuarioDTO;
import com.aldia.infraestructura.web.dto.AdminDTOs.CambiarEstadoDTO;
import com.aldia.infraestructura.web.dto.AdminDTOs.UsuarioAdminDTO;
import com.aldia.infraestructura.web.dto.NoticiaResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

/**
 * Panel del administrador. SeguridadConfiguracion exige el rol ADMINISTRADOR en /api/admin/**.
 */
@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
public class AdminControlador {

    private final ModerarNoticiaCasoDeUso moderarNoticiaCasoDeUso;
    private final GestionarUsuariosCasoDeUso gestionarUsuariosCasoDeUso;

    public AdminControlador(ModerarNoticiaCasoDeUso moderarNoticiaCasoDeUso,
                            GestionarUsuariosCasoDeUso gestionarUsuariosCasoDeUso) {
        this.moderarNoticiaCasoDeUso = moderarNoticiaCasoDeUso;
        this.gestionarUsuariosCasoDeUso = gestionarUsuariosCasoDeUso;
    }

    @GetMapping("/noticias")
    @Operation(summary = "Noticias para moderar (todas menos las borradas, o las de un estado)")
    public ResponseEntity<List<NoticiaResponseDTO>> noticias(
            @RequestParam(required = false) Noticia.Estado estado,
            @RequestParam(required = false) FiltroNoticias.Tipo tipo) {
        Boolean oficial = tipo == null || tipo == FiltroNoticias.Tipo.TODAS ? null : tipo == FiltroNoticias.Tipo.OFICIALES;
        return ResponseEntity.ok(moderarNoticiaCasoDeUso.listar(estado, oficial).stream()
                .map(NoticiaResponseDTO::desde)
                .toList());
    }

    @PutMapping("/noticias/{id}/estado")
    @Operation(summary = "Ocultar (OCULTA), volver a publicar (PUBLICADA) o borrar (ELIMINADA) una noticia")
    public ResponseEntity<NoticiaResponseDTO> cambiarEstado(@PathVariable Long id,
                                                            @Valid @RequestBody CambiarEstadoDTO solicitud,
                                                            Authentication autenticacion) {
        return ResponseEntity.ok(NoticiaResponseDTO.desde(
                moderarNoticiaCasoDeUso.cambiarEstado(autenticacion.getName(), id, solicitud.estado())));
    }

    @DeleteMapping("/noticias/{id}")
    @Operation(summary = "Borrar una noticia (borrado lógico: queda en estado ELIMINADA)")
    public ResponseEntity<Void> borrar(@PathVariable Long id, Authentication autenticacion) {
        moderarNoticiaCasoDeUso.cambiarEstado(autenticacion.getName(), id, Noticia.Estado.ELIMINADA);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuarios")
    @Operation(summary = "Cuentas registradas")
    public ResponseEntity<List<UsuarioAdminDTO>> usuarios() {
        return ResponseEntity.ok(gestionarUsuariosCasoDeUso.listar().stream().map(UsuarioAdminDTO::desde).toList());
    }

    @PutMapping("/usuarios/{id}")
    @Operation(summary = "Activar o desactivar una cuenta, cambiar su rol o fijar su nivel")
    public ResponseEntity<UsuarioAdminDTO> actualizarUsuario(@PathVariable Long id,
                                                             @Valid @RequestBody ActualizarUsuarioDTO solicitud,
                                                             Authentication autenticacion) {
        return ResponseEntity.ok(UsuarioAdminDTO.desde(gestionarUsuariosCasoDeUso.actualizar(autenticacion.getName(),
                id, new CambiosUsuario(solicitud.activo(), solicitud.rol(), solicitud.nivel()))));
    }
}
