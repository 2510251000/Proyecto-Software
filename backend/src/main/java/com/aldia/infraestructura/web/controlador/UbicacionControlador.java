package com.aldia.infraestructura.web.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.puerto.entrada.UbicacionCasoDeUso;
import com.aldia.infraestructura.web.dto.CiudadResponseDTO;
import com.aldia.infraestructura.web.dto.UbicacionDTOs.CiudadResueltaDTO;
import com.aldia.infraestructura.web.dto.UbicacionDTOs.LugarDTO;
import com.aldia.infraestructura.web.dto.UbicacionDTOs.ResolverUbicacionDTO;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

/**
 * Ubicación con la API externa (Google Maps o Nominatim, según GEO_PROVEEDOR).
 * Es pública porque el registro la necesita antes de tener sesión.
 */
@RestController
@RequestMapping("/api/ubicacion")
public class UbicacionControlador {

    private final UbicacionCasoDeUso ubicacionCasoDeUso;

    public UbicacionControlador(UbicacionCasoDeUso ubicacionCasoDeUso) {
        this.ubicacionCasoDeUso = ubicacionCasoDeUso;
    }

    @GetMapping("/ciudades")
    @Operation(summary = "Ciudades del catálogo (las que ya se resolvieron con la API)")
    public ResponseEntity<List<CiudadResponseDTO>> ciudades() {
        return ResponseEntity.ok(ubicacionCasoDeUso.listarCiudades().stream().map(CiudadResponseDTO::desde).toList());
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar un municipio por nombre en la API externa")
    public ResponseEntity<List<LugarDTO>> buscar(@RequestParam("q") String texto) {
        return ResponseEntity.ok(ubicacionCasoDeUso.buscar(texto).stream().map(LugarDTO::desde).toList());
    }

    @PostMapping("/resolver")
    @Operation(summary = "Convertir un resultado de búsqueda o unas coordenadas del GPS en una ciudad del catálogo")
    public ResponseEntity<CiudadResueltaDTO> resolver(@Valid @RequestBody ResolverUbicacionDTO solicitud) {
        Ciudad ciudad;
        if (solicitud.idLugar() != null && !solicitud.idLugar().isBlank()) {
            ciudad = ubicacionCasoDeUso.resolverLugar(solicitud.idLugar());
        } else if (solicitud.latitud() != null && solicitud.longitud() != null) {
            ciudad = ubicacionCasoDeUso.resolverCoordenadas(solicitud.latitud(), solicitud.longitud());
        } else {
            throw new DatosInvalidosExcepcion("Manda idLugar, o latitud y longitud");
        }
        return ResponseEntity.ok(new CiudadResueltaDTO(ciudad.id(), ciudad.nombre(), ciudad.departamento(),
                ciudad.latitud(), ciudad.longitud(), ubicacionCasoDeUso.proveedor()));
    }
}
