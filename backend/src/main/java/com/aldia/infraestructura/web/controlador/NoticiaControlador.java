package com.aldia.infraestructura.web.controlador;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.aldia.dominio.excepcion.ImagenInvalidaExcepcion;
import com.aldia.dominio.modelo.ArchivoImagen;
import com.aldia.dominio.modelo.ImagenSubida;
import com.aldia.dominio.puerto.entrada.CalificarNoticiaCasoDeUso;
import com.aldia.dominio.puerto.entrada.ImagenesNoticiaCasoDeUso;

import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.ListarNoticiasCasoDeUso;
import com.aldia.dominio.puerto.entrada.ObtenerNoticiaCasoDeUso;
import com.aldia.dominio.puerto.entrada.PublicarNoticiaCasoDeUso;
import com.aldia.infraestructura.configuracion.OpenApiConfiguracion;
import com.aldia.infraestructura.web.dto.NoticiaResponseDTO;
import com.aldia.infraestructura.web.dto.PublicarNoticiaRequestDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaControlador {

    private static final String ROL_ADMINISTRADOR = "ROLE_ADMINISTRADOR";

    private final ListarNoticiasCasoDeUso listarNoticiasCasoDeUso;
    private final ObtenerNoticiaCasoDeUso obtenerNoticiaCasoDeUso;
    private final PublicarNoticiaCasoDeUso publicarNoticiaCasoDeUso;
    private final ImagenesNoticiaCasoDeUso imagenesNoticiaCasoDeUso;
    private final CalificarNoticiaCasoDeUso calificarNoticiaCasoDeUso;
    private final long segundosCache;

    public NoticiaControlador(ListarNoticiasCasoDeUso listarNoticiasCasoDeUso,
                              ObtenerNoticiaCasoDeUso obtenerNoticiaCasoDeUso,
                              PublicarNoticiaCasoDeUso publicarNoticiaCasoDeUso,
                              ImagenesNoticiaCasoDeUso imagenesNoticiaCasoDeUso,
                              CalificarNoticiaCasoDeUso calificarNoticiaCasoDeUso,
                              @Value("${aldia.imagenes.cache-segundos}") long segundosCache) {
        this.listarNoticiasCasoDeUso = listarNoticiasCasoDeUso;
        this.obtenerNoticiaCasoDeUso = obtenerNoticiaCasoDeUso;
        this.publicarNoticiaCasoDeUso = publicarNoticiaCasoDeUso;
        this.imagenesNoticiaCasoDeUso = imagenesNoticiaCasoDeUso;
        this.calificarNoticiaCasoDeUso = calificarNoticiaCasoDeUso;
        this.segundosCache = segundosCache;
    }

    @GetMapping
    @Operation(summary = "Listar noticias publicadas, con filtros y búsqueda opcionales")
    public ResponseEntity<List<NoticiaResponseDTO>> listar(
            @Parameter(description = "TODAS, OFICIALES o COMUNITARIAS")
            @RequestParam(required = false) FiltroNoticias.Tipo tipo,
            @Parameter(description = "Solo las de esta ciudad")
            @RequestParam(required = false) Long ciudadId,
            @Parameter(description = "Texto a buscar en el título, el resumen y el contenido")
            @RequestParam(name = "q", required = false) String texto,
            @Parameter(description = "RECIENTES (predeterminado) o RECOMENDADAS")
            @RequestParam(required = false) FiltroNoticias.Orden orden,
            Authentication autenticacion) {
        List<Noticia> noticias = listarNoticiasCasoDeUso.listarPublicadas(new FiltroNoticias(tipo, ciudadId, texto, orden));
        Map<Long, Boolean> mios = calificarNoticiaCasoDeUso.misVotos(correoDe(autenticacion),
                noticias.stream().map(Noticia::getId).toList());
        return ResponseEntity.ok(noticias.stream().map(n -> NoticiaResponseDTO.desde(n, mios.get(n.getId()))).toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver una noticia publicada (404 si no existe, está oculta o eliminada)")
    public ResponseEntity<NoticiaResponseDTO> obtener(@PathVariable Long id, Authentication autenticacion) {
        Noticia noticia = obtenerNoticiaCasoDeUso.obtenerPublicada(id);
        Boolean mio = calificarNoticiaCasoDeUso.misVotos(correoDe(autenticacion), List.of(id)).get(id);
        return ResponseEntity.ok(NoticiaResponseDTO.desde(noticia, mio));
    }

    /** Correo de la sesión, o null si la petición llegó sin token. */
    private static String correoDe(Authentication autenticacion) {
        return autenticacion == null || autenticacion instanceof AnonymousAuthenticationToken
                ? null
                : autenticacion.getName();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Publicar una noticia sin fotos (respeta el límite diario del nivel y avisa a los de la misma ciudad)")
    public ResponseEntity<NoticiaResponseDTO> publicar(@Valid @RequestBody PublicarNoticiaRequestDTO solicitud,
                                                       Authentication autenticacion) {
        return creada(publicarNoticiaCasoDeUso.publicar(autenticacion.getName(), solicitud.aDominio()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = OpenApiConfiguracion.ESQUEMA_JWT)
    @Operation(summary = "Publicar una noticia con fotos: parte «datos» (el mismo JSON) y partes «imagenes» "
            + "(JPEG, PNG o WebP; la primera es la portada)")
    public ResponseEntity<NoticiaResponseDTO> publicarConImagenes(
            @Valid @RequestPart("datos") PublicarNoticiaRequestDTO solicitud,
            @RequestPart(name = "imagenes", required = false) List<MultipartFile> imagenes,
            Authentication autenticacion) {
        List<ImagenSubida> subidas = new ArrayList<>();
        List<MultipartFile> archivos = imagenes == null ? List.of() : imagenes;
        for (int i = 0; i < archivos.size(); i++) {
            subidas.add(aImagen(archivos.get(i), solicitud.descripcionImagen(i)));
        }
        return creada(publicarNoticiaCasoDeUso.publicar(autenticacion.getName(), solicitud.aDominio(), subidas));
    }

    @GetMapping("/{id}/imagenes/{orden}")
    @Operation(summary = "Una foto de la noticia (1 = portada). Si la noticia no está publicada, solo la ven su autor "
            + "y los administradores")
    public ResponseEntity<byte[]> imagen(@PathVariable Long id, @PathVariable int orden, Authentication autenticacion) {
        String correo = correoDe(autenticacion);
        boolean esAdministrador = correo != null && autenticacion.getAuthorities().stream()
                .anyMatch(permiso -> ROL_ADMINISTRADOR.equals(permiso.getAuthority()));
        ArchivoImagen archivo = imagenesNoticiaCasoDeUso.leer(id, orden, correo, esAdministrador);
        // Las fotos de noticias publicadas se pueden guardar en caché; las demás son privadas.
        CacheControl cache = archivo.publica()
                ? CacheControl.maxAge(segundosCache, TimeUnit.SECONDS).cachePublic()
                : CacheControl.noStore().cachePrivate();
        return ResponseEntity.ok()
                .cacheControl(cache)
                .contentType(MediaType.parseMediaType(archivo.formato().tipoMime()))
                .header("X-Content-Type-Options", "nosniff")
                .body(archivo.contenido());
    }

    private ResponseEntity<NoticiaResponseDTO> creada(Noticia publicada) {
        URI ubicacion = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(publicada.getId())
                .toUri();
        return ResponseEntity.created(ubicacion).body(NoticiaResponseDTO.desde(publicada));
    }

    private static ImagenSubida aImagen(MultipartFile archivo, String descripcion) {
        try {
            return new ImagenSubida(archivo.getOriginalFilename(), archivo.getBytes(), descripcion);
        } catch (IOException error) {
            throw new ImagenInvalidaExcepcion("No se pudo leer la foto «" + archivo.getOriginalFilename() + "»");
        }
    }
}
