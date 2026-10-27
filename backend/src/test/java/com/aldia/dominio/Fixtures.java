package com.aldia.dominio;

import java.time.LocalDateTime;
import java.util.List;

import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Usuario;

/**
 * Datos de prueba compartidos: los mismos tres niveles de la tabla nivel.
 */
public final class Fixtures {

    public static final Nivel NIVEL_1 = new Nivel(1L, 1, "Básico", 0, 3);
    public static final Nivel NIVEL_2 = new Nivel(2L, 2, "Activo", 50, 10);
    public static final Nivel NIVEL_3 = new Nivel(3L, 3, "Corresponsal Certificado", 150, 30);
    public static final List<Nivel> NIVELES = List.of(NIVEL_3, NIVEL_1, NIVEL_2);

    public static final Ciudad FUSAGASUGA = new Ciudad(1L, "Fusagasugá", "Cundinamarca", null, null, null);

    private Fixtures() {
    }

    public static Usuario usuario(Long id, Usuario.Rol rol, Nivel nivel, int puntaje) {
        return new Usuario(id, "usuario" + id + "@correo.com", "hash", rol, nivel,
                LocalDateTime.of(2026, 9, 1, 8, 0), true, "Usuario " + id, FUSAGASUGA, puntaje);
    }

    public static Noticia noticia(Long id, LocalDateTime fecha, boolean oficial, int nivelAutor, Long autorId) {
        return new Noticia(id, "Noticia " + id, "Resumen", "Contenido", fecha, oficial, Noticia.Estado.PUBLICADA,
                "Fusagasugá", 1L, autorId, "Autor " + autorId, nivelAutor, null, null);
    }
}
