package com.aldia.infraestructura.datosiniciales;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Al arrancar, publica las noticias reales que trae la aplicación (con su foto y la cita de la
 * fuente) si todavía no están. Se reconoce cada una por su título, así que arrancar muchas veces
 * no duplica nada ni toca lo que publicaron los usuarios. La foto se guarda con el almacén de
 * imágenes de siempre (disco o nube), igual que una foto subida desde Publicar.
 * Se apaga con NOTICIAS_INICIALES=false.
 */
@Component
@ConditionalOnProperty(name = "aldia.noticias-iniciales.cargar", havingValue = "true", matchIfMissing = true)
public class CargaNoticiasIniciales implements ApplicationRunner {

    static final String CARPETA = "datos-iniciales/noticias/";
    private static final Logger LOG = LoggerFactory.getLogger(CargaNoticiasIniciales.class);

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaccion;
    private final AlmacenImagenesPuerto almacen;
    private final ObjectMapper json;

    public CargaNoticiasIniciales(JdbcTemplate jdbc, TransactionTemplate transaccion, AlmacenImagenesPuerto almacen,
                                  ObjectMapper json) {
        this.jdbc = jdbc;
        this.transaccion = transaccion;
        this.almacen = almacen;
        this.json = json;
    }

    @Override
    public void run(ApplicationArguments argumentos) throws IOException {
        int nuevas = 0;
        for (NoticiaInicial noticia : leer()) {
            if (cargar(noticia)) {
                nuevas++;
            }
        }
        if (nuevas > 0) {
            LOG.info("Noticias iniciales: se publicaron {}", nuevas);
        }
    }

    /** Las noticias del archivo, en el orden en que se publican. */
    public List<NoticiaInicial> leer() throws IOException {
        try (InputStream entrada = new ClassPathResource(CARPETA + "noticias.json").getInputStream()) {
            return json.readValue(entrada, new TypeReference<List<NoticiaInicial>>() { });
        }
    }

    /** Publica la noticia si falta. Devuelve true si la publicó. */
    boolean cargar(NoticiaInicial noticia) throws IOException {
        Integer existentes = jdbc.queryForObject("SELECT COUNT(*) FROM noticia WHERE titulo = ?", Integer.class,
                noticia.titulo());
        if (existentes != null && existentes > 0) {
            return false;
        }
        Optional<Long> ciudad = primero("SELECT id FROM ciudad WHERE nombre = ?", noticia.ciudad());
        Optional<Long> autor = primero("SELECT id FROM usuario WHERE correo = ?", noticia.autor())
                .or(this::administrador);
        if (ciudad.isEmpty() || autor.isEmpty()) {
            LOG.warn("Noticia inicial sin ciudad o sin quien la publique, no se carga: {}", noticia.titulo());
            return false;
        }

        String clave = almacen.guardar(foto(noticia.foto()), "jpg");
        try {
            transaccion.executeWithoutResult(estado -> insertar(noticia, ciudad.get(), autor.get(), clave));
        } catch (RuntimeException error) {
            almacen.borrar(clave);
            throw error;
        }
        return true;
    }

    private void insertar(NoticiaInicial noticia, Long ciudadId, Long autorId, String clave) {
        Long id = jdbc.queryForObject("""
                INSERT INTO noticia (titulo, resumen, contenido, fecha_publicacion, oficial, estado,
                                     latitud, longitud, usuario_id, ciudad_id)
                VALUES (?, ?, ?, ?, ?, 'PUBLICADA', ?, ?, ?, ?) RETURNING id
                """, Long.class, noticia.titulo(), noticia.resumen(), noticia.contenido(),
                noticia.fechaPublicacion(), noticia.oficial(), noticia.latitud(), noticia.longitud(), autorId, ciudadId);
        jdbc.update("INSERT INTO multimedia (url, tipo, orden, noticia_id, texto_alternativo) "
                + "VALUES (?, 'IMAGEN', 1, ?, ?)", clave, id, noticia.textoAlternativo());
    }

    private Optional<Long> administrador() {
        return primero("SELECT id FROM usuario WHERE rol = ? AND activo ORDER BY id", "ADMINISTRADOR");
    }

    private Optional<Long> primero(String consulta, String valor) {
        return jdbc.queryForList(consulta, Long.class, valor).stream().findFirst();
    }

    private static byte[] foto(String archivo) throws IOException {
        try (InputStream entrada = new ClassPathResource(CARPETA + "fotos/" + archivo).getInputStream()) {
            return entrada.readAllBytes();
        }
    }
}
