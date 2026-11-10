package com.aldia.dominio.puerto.salida;

import java.util.Optional;

/**
 * Dónde viven los archivos de las fotos. El primer adaptador guarda en disco; con varios
 * servidores se cambia por uno de almacenamiento en la nube sin tocar los casos de uso.
 */
public interface AlmacenImagenesPuerto {

    /** Guarda el archivo y devuelve su clave (con la que luego se lee o se borra). */
    String guardar(byte[] contenido, String extension);

    Optional<byte[]> leer(String clave);

    /** Borra el archivo si existe; no falla si ya no estaba. */
    void borrar(String clave);
}
