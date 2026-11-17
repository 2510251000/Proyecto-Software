package com.aldia.infraestructura.almacenamiento;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.aldia.dominio.excepcion.AlmacenamientoExcepcion;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;

/**
 * Guarda los archivos de las fotos en la tabla archivo_imagen (IMAGENES_ALMACEN=base-datos).
 * Sirve para servidores sin disco permanente, como el plan gratuito de Render: la base de
 * Neon sí guarda todo. Las fotos llegan ya reducidas, así que ocupan poco.
 */
@Component
@ConditionalOnProperty(name = "aldia.imagenes.almacen", havingValue = "base-datos")
public class AlmacenImagenesBaseDatosAdaptador implements AlmacenImagenesPuerto {

    private static final Pattern EXTENSION_VALIDA = Pattern.compile("^(jpg|png|webp)$");
    private static final String NO_DISPONIBLE = "No se pudo guardar o leer la foto. Inténtalo de nuevo";

    private final JdbcTemplate jdbc;

    public AlmacenImagenesBaseDatosAdaptador(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public String guardar(byte[] contenido, String extension) {
        if (!EXTENSION_VALIDA.matcher(extension).matches()) {
            throw new IllegalArgumentException("Extensión no permitida: " + extension);
        }
        String clave = UUID.randomUUID() + "." + extension;
        try {
            jdbc.update("INSERT INTO archivo_imagen (clave, contenido) VALUES (?, ?)", clave, contenido);
        } catch (DataAccessException error) {
            throw new AlmacenamientoExcepcion(NO_DISPONIBLE, error);
        }
        return clave;
    }

    @Override
    public Optional<byte[]> leer(String clave) {
        try {
            List<byte[]> filas = jdbc.query("SELECT contenido FROM archivo_imagen WHERE clave = ?",
                    (fila, numero) -> fila.getBytes(1), clave);
            return filas.stream().findFirst();
        } catch (DataAccessException error) {
            throw new AlmacenamientoExcepcion(NO_DISPONIBLE, error);
        }
    }

    @Override
    public void borrar(String clave) {
        try {
            jdbc.update("DELETE FROM archivo_imagen WHERE clave = ?", clave);
        } catch (DataAccessException error) {
            throw new AlmacenamientoExcepcion(NO_DISPONIBLE, error);
        }
    }
}
