package com.aldia.infraestructura.almacenamiento;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.aldia.dominio.excepcion.AlmacenamientoExcepcion;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;

/**
 * Guarda las fotos en una carpeta del servidor (IMAGENES_DIRECTORIO; en Docker, el volumen
 * «imagenes»). Cada archivo se llama con un UUID: el nombre que puso el usuario nunca se usa,
 * así no hay rutas raras ni archivos que se pisen.
 * Con varios servidores esta carpeta no se comparte: ahí se cambia por un adaptador de nube.
 */
@Component
public class AlmacenImagenesDiscoAdaptador implements AlmacenImagenesPuerto {

    /** Solo claves que este adaptador generó: «uuid.extensión». Impide salir de la carpeta. */
    private static final Pattern CLAVE_VALIDA = Pattern.compile("^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.(jpg|png|webp)$");

    private final Path carpeta;

    public AlmacenImagenesDiscoAdaptador(@Value("${aldia.imagenes.directorio}") String directorio) {
        this.carpeta = Path.of(directorio).toAbsolutePath().normalize();
    }

    @Override
    public String guardar(byte[] contenido, String extension) {
        String clave = UUID.randomUUID() + "." + extension;
        if (!CLAVE_VALIDA.matcher(clave).matches()) {
            throw new IllegalArgumentException("Extensión no permitida: " + extension);
        }
        try {
            Files.createDirectories(carpeta);
            Files.write(carpeta.resolve(clave), contenido, StandardOpenOption.CREATE_NEW);
            return clave;
        } catch (IOException error) {
            throw new AlmacenamientoExcepcion("No se pudo guardar la foto", error);
        }
    }

    @Override
    public Optional<byte[]> leer(String clave) {
        if (!esValida(clave)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Files.readAllBytes(carpeta.resolve(clave)));
        } catch (NoSuchFileException noExiste) {
            return Optional.empty();
        } catch (IOException error) {
            throw new AlmacenamientoExcepcion("No se pudo leer la foto", error);
        }
    }

    @Override
    public void borrar(String clave) {
        if (!esValida(clave)) {
            return;
        }
        try {
            Files.deleteIfExists(carpeta.resolve(clave));
        } catch (IOException error) {
            throw new AlmacenamientoExcepcion("No se pudo borrar la foto", error);
        }
    }

    private static boolean esValida(String clave) {
        return clave != null && CLAVE_VALIDA.matcher(clave).matches();
    }
}
