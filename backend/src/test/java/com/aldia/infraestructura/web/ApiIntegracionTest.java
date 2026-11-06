package com.aldia.infraestructura.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.aldia.dominio.modelo.UbicacionEncontrada;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

/**
 * Pruebas de los endpoints principales con la aplicación completa: Spring Security,
 * controladores, casos de uso, JPA y las migraciones de Flyway (incluidos los datos de
 * demostración) sobre un PostgreSQL real que se arranca solo para las pruebas.
 * No usa la base ni la contraseña del equipo, ni sale a internet (la API de mapas se reemplaza).
 */
@SpringBootTest(properties = {
        "spring.profiles.active=dev",
        "jwt.clave-secreta=clave-solo-para-pruebas-automaticas-0123456789-0123456789-0123456789-abcdef",
        "jwt.expiracion-ms=3600000",
        "cors.origenes-permitidos=http://localhost:4200",
        "spring.flyway.locations=classpath:db/migration,classpath:db/demo",
        "aldia.geocodificacion.proveedor=nominatim"
})
@AutoConfigureMockMvc
@Import(ApiIntegracionTest.GeocodificadorDePrueba.class)
class ApiIntegracionTest {

    private static final EmbeddedPostgres BASE = arrancarBase();
    private static final String CLAVE_DEMO = "Usuario12345";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private JdbcTemplate jdbc;

    private static EmbeddedPostgres arrancarBase() {
        try {
            return EmbeddedPostgres.builder().start();
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo arrancar PostgreSQL embebido", ex);
        }
    }

    @DynamicPropertySource
    static void baseDeDatos(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", () -> BASE.getJdbcUrl("postgres", "postgres"));
        registro.add("spring.datasource.username", () -> "postgres");
        registro.add("spring.datasource.password", () -> "postgres");
        registro.add("aldia.imagenes.directorio", ApiIntegracionTest::carpetaImagenes);
    }

    private static String carpetaImagenes() {
        try {
            return Files.createTempDirectory("aldia-imagenes-pruebas").toString();
        } catch (IOException ex) {
            throw new IllegalStateException(ex);
        }
    }

    /** Responde como la API de mapas, sin red: Fusagasugá por coordenadas y Tocaima por búsqueda. */
    @TestConfiguration
    static class GeocodificadorDePrueba {

        static final UbicacionEncontrada FUSA = new UbicacionEncontrada("osm:R1414846", "Fusagasugá", "Cundinamarca",
                "Fusagasugá, Cundinamarca, Colombia", new BigDecimal("4.33720000"), new BigDecimal("-74.36390000"),
                "prueba");
        static final UbicacionEncontrada TOCAIMA = new UbicacionEncontrada("osm:R999", "Tocaima", "Cundinamarca",
                "Tocaima, Cundinamarca, Colombia", new BigDecimal("4.45890000"), new BigDecimal("-74.63420000"),
                "prueba");

        @Bean
        @Primary
        GeocodificadorPuerto geocodificadorDePrueba() {
            return new GeocodificadorPuerto() {
                @Override
                public List<UbicacionEncontrada> buscar(String texto) {
                    return texto.toLowerCase().startsWith("toc") ? List.of(TOCAIMA) : List.of();
                }

                @Override
                public Optional<UbicacionEncontrada> enCoordenadas(BigDecimal latitud, BigDecimal longitud) {
                    return latitud.compareTo(BigDecimal.ZERO) > 0 ? Optional.of(FUSA) : Optional.empty();
                }

                @Override
                public Optional<UbicacionEncontrada> porIdLugar(String idLugar) {
                    return Optional.ofNullable(Map.of(FUSA.idLugar(), FUSA, TOCAIMA.idLugar(), TOCAIMA).get(idLugar));
                }

                @Override
                public String proveedor() {
                    return "prueba";
                }
            };
        }
    }

    // ------------------------------------------------------------------ ayudas

    private JsonNode leer(MockHttpServletRequestBuilder peticion, int estadoEsperado) throws Exception {
        String cuerpo = mvc.perform(peticion).andExpect(status().is(estadoEsperado))
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        return cuerpo.isBlank() ? json.nullNode() : json.readTree(cuerpo);
    }

    private MockHttpServletRequestBuilder conJson(MockHttpServletRequestBuilder peticion, Object cuerpo) throws Exception {
        return peticion.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(cuerpo));
    }

    private MockHttpServletRequestBuilder conToken(MockHttpServletRequestBuilder peticion, String token) {
        return peticion.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    private String token(String correo, String contrasena) throws Exception {
        return leer(conJson(post("/api/auth/login"), Map.of("correo", correo, "contrasena", contrasena)), 200)
                .get("token").asText();
    }

    private long idCiudad(String nombre) throws Exception {
        for (JsonNode ciudad : leer(get("/api/ubicacion/ciudades"), 200)) {
            if (ciudad.get("nombre").asText().equals(nombre)) {
                return ciudad.get("id").asLong();
            }
        }
        throw new AssertionError("No está la ciudad " + nombre);
    }

    /** Registra un usuario nuevo en la ciudad indicada y devuelve su token. */
    private String usuarioNuevo(String ciudad) throws Exception {
        String correo = "prueba-" + UUID.randomUUID() + "@correo.com";
        leer(conJson(post("/api/auth/registro"), Map.of("correo", correo, "contrasena", "clave12345",
                "nombre", "Vecino de prueba", "ciudadId", idCiudad(ciudad))), 201);
        return token(correo, "clave12345");
    }

    private JsonNode publicar(String token, String titulo, long ciudadId, int estadoEsperado) throws Exception {
        return leer(conToken(conJson(post("/api/noticias"), Map.of("titulo", titulo, "resumen", "Resumen corto",
                "contenido", "Contenido de la noticia de prueba.", "ciudadId", ciudadId)), token), estadoEsperado);
    }

    private long noLeidas(String token) throws Exception {
        return leer(conToken(get("/api/notificaciones/no-leidas"), token), 200).get("cantidad").asLong();
    }

    private static List<JsonNode> lista(JsonNode arreglo) {
        List<JsonNode> elementos = new ArrayList<>();
        arreglo.forEach(elementos::add);
        return elementos;
    }

    // ------------------------------------------------------------------ pruebas

    @Test
    void lasCuentasDeDemostracionPuedenEntrar() throws Exception {
        assertThat(token("admin@aldia.com", "Admin12345")).isNotBlank();
        assertThat(token("corresponsal@aldia.com", CLAVE_DEMO)).isNotBlank();
        mvc.perform(conJson(post("/api/auth/login"), Map.of("correo", "admin@aldia.com", "contrasena", "mala")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void elRegistroPideCiudadYElPerfilMuestraNivelYCupo() throws Exception {
        mvc.perform(conJson(post("/api/auth/registro"), Map.of("correo", "sinciudad@correo.com", "contrasena", "clave12345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La ciudad es obligatoria"));

        String token = usuarioNuevo("Fusagasugá");
        JsonNode perfil = leer(conToken(get("/api/usuarios/me"), token), 200);

        assertThat(perfil.get("nivelNumero").asInt()).isEqualTo(1);
        assertThat(perfil.get("ciudad").get("nombre").asText()).isEqualTo("Fusagasugá");
        assertThat(perfil.get("cupo").get("limite").asInt()).isEqualTo(3);
        assertThat(perfil.get("cupo").get("restantes").asInt()).isEqualTo(3);
        assertThat(perfil.get("siguienteNivel").get("numero").asInt()).isEqualTo(2);
    }

    @Test
    void elListadoFiltraPorTipoYCiudadYBuscaSinImportarTildes() throws Exception {
        List<JsonNode> oficiales = lista(leer(get("/api/noticias").param("tipo", "OFICIALES"), 200));
        List<JsonNode> comunitarias = lista(leer(get("/api/noticias").param("tipo", "COMUNITARIAS"), 200));
        List<JsonNode> deZipaquira = lista(leer(get("/api/noticias").param("ciudadId",
                String.valueOf(idCiudad("Zipaquirá"))), 200));
        List<JsonNode> busqueda = lista(leer(get("/api/noticias").param("q", "GASTRONOMICA"), 200));

        assertThat(oficiales).isNotEmpty().allSatisfy(n -> assertThat(n.get("oficial").asBoolean()).isTrue());
        assertThat(comunitarias).isNotEmpty().allSatisfy(n -> assertThat(n.get("oficial").asBoolean()).isFalse());
        assertThat(deZipaquira).isNotEmpty().allSatisfy(n -> assertThat(n.get("ciudad").asText()).isEqualTo("Zipaquirá"));
        assertThat(busqueda).extracting(n -> n.get("titulo").asText())
                .contains("La feria gastronómica reunirá a cuarenta emprendedores");

        List<JsonNode> todas = lista(leer(get("/api/noticias").param("orden", "RECOMENDADAS"), 200));
        assertThat(todas).extracting(n -> n.get("titulo").asText()).doesNotContain("Publicación retirada por moderación");
        mvc.perform(get("/api/noticias").param("tipo", "INVENTADO")).andExpect(status().isBadRequest());
    }

    @Test
    void alPublicarSeAvisaALosDeLaMismaCiudadYNoALosDeOtra() throws Exception {
        String autor = usuarioNuevo("Fusagasugá");
        String vecina = token("vecina@aldia.com", CLAVE_DEMO);
        String lectorDeZipaquira = token("lector@aldia.com", CLAVE_DEMO);
        long vecinaAntes = noLeidas(vecina);
        long lectorAntes = noLeidas(lectorDeZipaquira);

        JsonNode noticia = publicar(autor, "Se cayó un árbol en la vía principal", idCiudad("Fusagasugá"), 201);

        assertThat(noticia.get("oficial").asBoolean()).isFalse();
        assertThat(noLeidas(vecina)).isEqualTo(vecinaAntes + 1);
        assertThat(noLeidas(lectorDeZipaquira)).isEqualTo(lectorAntes);
        assertThat(noLeidas(autor)).isZero();

        JsonNode aviso = leer(conToken(get("/api/notificaciones"), vecina), 200).get(0);
        assertThat(aviso.get("tipo").asText()).isEqualTo("CERCANIA");
        assertThat(aviso.get("noticiaId").asLong()).isEqualTo(noticia.get("id").asLong());

        leer(conToken(put("/api/notificaciones/" + aviso.get("id").asLong() + "/leida"), vecina), 204);
        assertThat(noLeidas(vecina)).isEqualTo(vecinaAntes);

        assertThat(leer(conToken(get("/api/usuarios/me"), autor), 200).get("puntaje").asInt()).isEqualTo(10);
    }

    @Test
    void elNivel1NoPuedePublicarMasDeTresNoticiasAlDia() throws Exception {
        String autor = usuarioNuevo("Girardot");
        long girardot = idCiudad("Girardot");

        for (int i = 1; i <= 3; i++) {
            publicar(autor, "Noticia número " + i, girardot, 201);
        }
        JsonNode rechazo = publicar(autor, "Noticia número 4", girardot, 429);

        assertThat(rechazo.get("mensaje").asText()).contains("límite de 3 noticias");
        assertThat(leer(conToken(get("/api/usuarios/me"), autor), 200).get("cupo").get("restantes").asInt()).isZero();
    }

    @Test
    void sinSesionNoSePuedePublicarNiVerNotificaciones() throws Exception {
        mvc.perform(conJson(post("/api/noticias"), Map.of("titulo", "x", "contenido", "y", "ciudadId", 1)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notificaciones")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    void elAdministradorOcultaYBorraNoticiasComunitariasYAvisaAlAutor() throws Exception {
        String autor = usuarioNuevo("Chía");
        String admin = token("admin@aldia.com", "Admin12345");
        long id = publicar(autor, "Rumor sin confirmar", idCiudad("Chía"), 201).get("id").asLong();

        mvc.perform(conToken(get("/api/admin/noticias"), autor)).andExpect(status().isForbidden());

        JsonNode oculta = leer(conToken(conJson(put("/api/admin/noticias/" + id + "/estado"), Map.of("estado", "OCULTA")),
                admin), 200);
        assertThat(oculta.get("estado").asText()).isEqualTo("OCULTA");
        mvc.perform(get("/api/noticias/" + id)).andExpect(status().isNotFound());

        JsonNode aviso = leer(conToken(get("/api/notificaciones"), autor), 200).get(0);
        assertThat(aviso.get("tipo").asText()).isEqualTo("MODERACION");

        leer(conToken(delete("/api/admin/noticias/" + id), admin), 204);
        mvc.perform(conToken(conJson(put("/api/admin/noticias/" + id + "/estado"), Map.of("estado", "PUBLICADA")), admin))
                .andExpect(status().isForbidden());
    }

    @Test
    void elAdministradorGestionaUsuarios() throws Exception {
        String admin = token("admin@aldia.com", "Admin12345");
        String correo = "gestion-" + UUID.randomUUID() + "@correo.com";
        long id = leer(conJson(post("/api/auth/registro"), Map.of("correo", correo, "contrasena", "clave12345",
                "ciudadId", idCiudad("Soacha"))), 201).get("id").asLong();

        JsonNode usuarios = leer(conToken(get("/api/admin/usuarios"), admin), 200);
        assertThat(lista(usuarios)).anySatisfy(u -> {
            assertThat(u.get("correo").asText()).isEqualTo("corresponsal@aldia.com");
            assertThat(u.get("nivel").asInt()).isEqualTo(3);
        });

        JsonNode cambiado = leer(conToken(conJson(put("/api/admin/usuarios/" + id), Map.of("nivel", 2)), admin), 200);
        assertThat(cambiado.get("nivel").asInt()).isEqualTo(2);
        assertThat(cambiado.get("puntaje").asInt()).isEqualTo(50);

        leer(conToken(conJson(put("/api/admin/usuarios/" + id), Map.of("activo", false)), admin), 200);
        mvc.perform(conJson(post("/api/auth/login"), Map.of("correo", correo, "contrasena", "clave12345")))
                .andExpect(status().isForbidden());
    }

    @Test
    void laUbicacionReutilizaLasCiudadesDelCatalogoYRegistraLasNuevas() throws Exception {
        JsonNode porGps = leer(conJson(post("/api/ubicacion/resolver"),
                Map.of("latitud", 4.3372, "longitud", -74.3639)), 200);
        assertThat(porGps.get("id").asLong()).isEqualTo(idCiudad("Fusagasugá"));
        assertThat(porGps.get("proveedor").asText()).isEqualTo("prueba");

        JsonNode resultados = leer(get("/api/ubicacion/buscar").param("q", "Tocai"), 200);
        assertThat(resultados.get(0).get("ciudad").asText()).isEqualTo("Tocaima");

        JsonNode tocaima = leer(conJson(post("/api/ubicacion/resolver"),
                Map.of("idLugar", resultados.get(0).get("idLugar").asText())), 200);
        assertThat(tocaima.get("id").asLong()).isEqualTo(idCiudad("Tocaima"));

        mvc.perform(get("/api/ubicacion/buscar").param("q", "ab")).andExpect(status().isBadRequest());
        mvc.perform(conJson(post("/api/ubicacion/resolver"), Map.of("latitud", -10, "longitud", -74)))
                .andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------ fotos (MF02_003)

    private static byte[] jpegConUbicacion() throws IOException {
        BufferedImage imagen = new BufferedImage(60, 40, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        ImageIO.write(imagen, "jpeg", salida);
        byte[] jpeg = salida.toByteArray();
        byte[] exif = "Exif\0\0GPS-CASA-DE-LA-AUTORA".getBytes(StandardCharsets.ISO_8859_1);
        java.nio.ByteBuffer conExif = java.nio.ByteBuffer.allocate(jpeg.length + 4 + exif.length);
        conExif.put(jpeg, 0, 2).put((byte) 0xFF).put((byte) 0xE1).putShort((short) (exif.length + 2)).put(exif)
                .put(jpeg, 2, jpeg.length - 2);
        return conExif.array();
    }

    private MockMultipartFile datos(long ciudadId, List<String> descripciones) throws Exception {
        Map<String, Object> cuerpo = Map.of("titulo", "Así quedó el parque después de la lluvia",
                "resumen", "Con fotos", "contenido", "La comunidad comparte cómo quedó el parque.",
                "ciudadId", ciudadId, "descripcionesImagenes", descripciones);
        return new MockMultipartFile("datos", "", MediaType.APPLICATION_JSON_VALUE, json.writeValueAsBytes(cuerpo));
    }

    @Test
    void sePublicaConFotosDesdeMultipartYSeSirvenSinElExif() throws Exception {
        String autor = usuarioNuevo("Fusagasugá");
        MockMultipartFile foto = new MockMultipartFile("imagenes", "IMG_2041.jpg", "image/jpeg", jpegConUbicacion());

        JsonNode noticia = leer(conToken(multipart("/api/noticias")
                .file(datos(idCiudad("Fusagasugá"), List.of("Árboles caídos en el parque")))
                .file(foto), autor), 201);

        JsonNode imagenes = noticia.get("imagenes");
        assertThat(imagenes).hasSize(1);
        assertThat(imagenes.get(0).get("orden").asInt()).isEqualTo(1);
        assertThat(imagenes.get(0).get("textoAlternativo").asText()).isEqualTo("Árboles caídos en el parque");
        String url = imagenes.get(0).get("url").asText();
        assertThat(url).isEqualTo("/api/noticias/" + noticia.get("id").asLong() + "/imagenes/1");

        var respuesta = mvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse();
        assertThat(respuesta.getContentType()).isEqualTo("image/jpeg");
        assertThat(respuesta.getHeader(HttpHeaders.CACHE_CONTROL)).contains("max-age").contains("public");
        String bytes = new String(respuesta.getContentAsByteArray(), StandardCharsets.ISO_8859_1);
        assertThat(bytes).doesNotContain("GPS-CASA-DE-LA-AUTORA").doesNotContain("Exif");

        JsonNode enListado = lista(leer(get("/api/noticias"), 200)).stream()
                .filter(n -> n.get("id").asLong() == noticia.get("id").asLong()).findFirst().orElseThrow();
        assertThat(enListado.get("imagenes")).hasSize(1);
        mvc.perform(get(url.replace("/1", "/2"))).andExpect(status().isNotFound());
    }

    @Test
    void unArchivoQueNoEsImagenOMasDeCuatroFotosSeRechazan() throws Exception {
        String autor = usuarioNuevo("Chía");
        long chia = idCiudad("Chía");
        MockMultipartFile falsa = new MockMultipartFile("imagenes", "foto.jpg", "image/jpeg",
                "esto es un documento de texto".getBytes(StandardCharsets.UTF_8));

        JsonNode rechazo = leer(conToken(multipart("/api/noticias").file(datos(chia, List.of())).file(falsa), autor), 400);
        assertThat(rechazo.get("mensaje").asText()).isEqualTo("La foto «foto.jpg» no es una imagen JPEG, PNG o WebP");

        var peticion = multipart("/api/noticias").file(datos(chia, List.of()));
        byte[] jpeg = jpegConUbicacion();
        for (int i = 1; i <= 5; i++) {
            peticion.file(new MockMultipartFile("imagenes", "f" + i + ".jpg", "image/jpeg", jpeg));
        }
        JsonNode demasiadas = leer(conToken(peticion, autor), 400);
        assertThat(demasiadas.get("mensaje").asText()).isEqualTo("Puedes subir máximo 4 fotos por noticia");

        assertThat(leer(conToken(get("/api/usuarios/me"), autor), 200).get("cupo").get("publicadasHoy").asInt())
                .isZero();
    }

    @Test
    void laFotoDeUnaNoticiaOcultaSoloLaVenElAutorYElAdministrador() throws Exception {
        String autor = usuarioNuevo("Soacha");
        String otro = usuarioNuevo("Soacha");
        String admin = token("admin@aldia.com", "Admin12345");
        JsonNode noticia = leer(conToken(multipart("/api/noticias")
                .file(datos(idCiudad("Soacha"), List.of()))
                .file(new MockMultipartFile("imagenes", "a.jpg", "image/jpeg", jpegConUbicacion())), autor), 201);
        long id = noticia.get("id").asLong();
        String url = "/api/noticias/" + id + "/imagenes/1";

        leer(conToken(conJson(put("/api/admin/noticias/" + id + "/estado"), Map.of("estado", "OCULTA")), admin), 200);

        mvc.perform(get(url)).andExpect(status().isNotFound());
        mvc.perform(conToken(get(url), otro)).andExpect(status().isNotFound());
        var delAutor = mvc.perform(conToken(get(url), autor)).andExpect(status().isOk()).andReturn().getResponse();
        assertThat(delAutor.getHeader(HttpHeaders.CACHE_CONTROL)).contains("no-store");
        mvc.perform(conToken(get(url), admin)).andExpect(status().isOk());
    }

    @Test
    void sinLaParteDatosResponde400() throws Exception {
        String autor = usuarioNuevo("Girardot");
        JsonNode rechazo = leer(conToken(multipart("/api/noticias")
                .file(new MockMultipartFile("imagenes", "a.jpg", "image/jpeg", jpegConUbicacion())), autor), 400);
        assertThat(rechazo.get("mensaje").asText()).contains("datos");
    }

    // ------------------------------------------------------------------ interacción (MF03)

    @Test
    void comentariosCalificacionesYReportesDeUnaNoticia() throws Exception {
        String autor = usuarioNuevo("Fusagasugá");
        String lector = usuarioNuevo("Fusagasugá");
        String admin = token("admin@aldia.com", "Admin12345");
        long id = publicar(autor, "Llegaron los buses nuevos", idCiudad("Fusagasugá"), 201).get("id").asLong();
        String base = "/api/noticias/" + id;
        long avisosAntes = noLeidas(autor);

        // Comentarios: leer es público; comentar pide sesión y avisa al autor.
        assertThat(leer(get(base + "/comentarios"), 200)).isEmpty();
        mvc.perform(conJson(post(base + "/comentarios"), Map.of("contenido", "hola"))).andExpect(status().isUnauthorized());
        JsonNode vacio = leer(conToken(conJson(post(base + "/comentarios"), Map.of("contenido", "  ")), lector), 400);
        assertThat(vacio.get("mensaje").asText()).isEqualTo("Escribe un comentario");
        leer(conToken(conJson(post(base + "/comentarios"), Map.of("contenido", "x".repeat(1001))), lector), 400);
        JsonNode comentario = leer(conToken(conJson(post(base + "/comentarios"),
                Map.of("contenido", "¡Por fin! Ya era hora.")), lector), 201);
        assertThat(comentario.get("autor").asText()).isEqualTo("Vecino de prueba");
        assertThat(lista(leer(get(base + "/comentarios"), 200))).hasSize(1);
        assertThat(noLeidas(autor)).isEqualTo(avisosAntes + 1);

        long comentarioId = comentario.get("id").asLong();
        mvc.perform(conToken(delete(base + "/comentarios/" + comentarioId), autor)).andExpect(status().isForbidden());
        leer(conToken(delete(base + "/comentarios/" + comentarioId), admin), 204);
        assertThat(leer(get(base + "/comentarios"), 200)).isEmpty();

        // Calificación: una por usuario; el autor no puede calificarse.
        JsonNode calificacion = leer(conToken(conJson(put(base + "/calificacion"), Map.of("valor", 4)), lector), 200);
        assertThat(calificacion.get("promedio").asDouble()).isEqualTo(4.0);
        assertThat(calificacion.get("cantidadCalificaciones").asLong()).isEqualTo(1);
        calificacion = leer(conToken(conJson(put(base + "/calificacion"), Map.of("valor", 2)), lector), 200);
        assertThat(calificacion.get("promedio").asDouble()).isEqualTo(2.0);
        assertThat(calificacion.get("cantidadCalificaciones").asLong()).isEqualTo(1);
        leer(conToken(conJson(put(base + "/calificacion"), Map.of("valor", 6)), lector), 400);
        leer(conToken(conJson(put(base + "/calificacion"), Map.of("valor", 5)), autor), 403);
        assertThat(noLeidas(autor)).isEqualTo(avisosAntes + 2);

        JsonNode vista = leer(conToken(get(base), lector), 200);
        assertThat(vista.get("miCalificacion").asInt()).isEqualTo(2);
        assertThat(leer(get(base), 200).get("miCalificacion").isNull()).isTrue();
        assertThat(leer(get(base), 200).get("promedio").asDouble()).isEqualTo(2.0);

        // Reportes: uno por usuario y noticia; el administrador los revisa.
        JsonNode reporte = leer(conToken(conJson(post(base + "/reportes"),
                Map.of("motivo", "NOTICIA_FALSA", "descripcion", "No es cierto")), lector), 201);
        assertThat(reporte.get("estado").asText()).isEqualTo("PENDIENTE");
        JsonNode repetido = leer(conToken(conJson(post(base + "/reportes"), Map.of("motivo", "SPAM")), lector), 409);
        assertThat(repetido.get("mensaje").asText()).contains("Ya reportaste");
        leer(conToken(conJson(post(base + "/reportes"), Map.of("motivo", "INVENTADO")), autor), 400);

        mvc.perform(conToken(get("/api/admin/reportes"), lector)).andExpect(status().isForbidden());
        List<JsonNode> pendientes = lista(leer(conToken(get("/api/admin/reportes").param("estado", "PENDIENTE"), admin), 200));
        assertThat(pendientes).anySatisfy(r -> assertThat(r.get("noticiaId").asLong()).isEqualTo(id));
        long reporteId = reporte.get("id").asLong();
        JsonNode revisado = leer(conToken(conJson(put("/api/admin/reportes/" + reporteId),
                Map.of("estado", "REVISADO")), admin), 200);
        assertThat(revisado.get("estado").asText()).isEqualTo("REVISADO");
        leer(conToken(conJson(put("/api/admin/reportes/" + reporteId), Map.of("estado", "PENDIENTE")), admin), 400);
        leer(conToken(conJson(put("/api/admin/reportes/999999"), Map.of("estado", "DESCARTADO")), admin), 404);
    }

    @Test
    void elRegistroYElInicioDeSesionQuedanEnElHistorial() throws Exception {
        String correo = "historial-" + UUID.randomUUID() + "@correo.com";
        leer(conJson(post("/api/auth/registro"), Map.of("correo", correo, "contrasena", "clave12345",
                "ciudadId", idCiudad("Chía"))), 201);
        token(correo, "clave12345");
        mvc.perform(conJson(post("/api/auth/login"), Map.of("correo", correo, "contrasena", "equivocada")))
                .andExpect(status().isUnauthorized());

        List<String> acciones = jdbc.queryForList("SELECT h.accion FROM historial h JOIN usuario u ON u.id = h.usuario_id "
                + "WHERE u.correo = ? ORDER BY h.id", String.class, correo);
        assertThat(acciones).containsExactly("REGISTRO", "INICIO_SESION");
    }

    @Test
    void laDocumentacionDeLaApiSigueDisponible() throws Exception {
        JsonNode documento = leer(get("/v3/api-docs"), 200);
        assertThat(documento.get("paths").has("/api/noticias/{noticiaId}/comentarios")).isTrue();
        assertThat(documento.get("paths").has("/api/noticias/{id}/imagenes/{orden}")).isTrue();
    }
}
