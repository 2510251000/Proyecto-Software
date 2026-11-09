package com.aldia.infraestructura.almacenamiento;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Optional;

import com.aldia.dominio.excepcion.AlmacenamientoExcepcion;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;

/**
 * Guarda las fotos en una carpeta del servidor (IMAGENES_DIRECTORIO). Sirve para trabajar en
 * local sin Docker; en Docker y en producción se usa {@link AlmacenImagenesS3Adaptador}, porque
 * una carpeta no se comparte entre servidores ni sobrevive a que se recree el contenedor.
 */
public class AlmacenImagenesDiscoAdaptador implements AlmacenImagenesPuerto {

    private final Path carpeta;

    public AlmacenImagenesDiscoAdaptador(String directorio) {
        this.carpeta = Path.of(directorio).toAbsolutePath().normalize();
    }

    @Override
    public String guardar(byte[] contenido, String extension) {
        String clave = ClavesDeImagen.nueva(extension);
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
        if (!ClavesDeImagen.esValida(clave)) {
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
        if (!ClavesDeImagen.esValida(clave)) {
            return;
        }
        try {
            Files.deleteIfExists(carpeta.resolve(clave));
        } catch (IOException error) {
            throw new AlmacenamientoExcepcion("No se pudo borrar la foto", error);
        }
    }
}
