package com.aldia.dominio.modelo;

/** Foto ya validada y limpia (sin metadatos), lista para guardarse. */
public record ImagenProcesada(byte[] contenido, FormatoImagen formato) {
}
