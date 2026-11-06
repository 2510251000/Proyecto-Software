package com.aldia.dominio.modelo;

/** Formatos de imagen que acepta el portal, con su extensión y su tipo MIME. */
public enum FormatoImagen {
    JPEG("jpg", "image/jpeg"),
    PNG("png", "image/png"),
    WEBP("webp", "image/webp");

    private final String extension;
    private final String tipoMime;

    FormatoImagen(String extension, String tipoMime) {
        this.extension = extension;
        this.tipoMime = tipoMime;
    }

    public String extension() {
        return extension;
    }

    public String tipoMime() {
        return tipoMime;
    }

    /** El formato que corresponde a una extensión guardada, o JPEG si no se reconoce. */
    public static FormatoImagen desdeExtension(String extension) {
        for (FormatoImagen formato : values()) {
            if (formato.extension.equalsIgnoreCase(extension)) {
                return formato;
            }
        }
        return JPEG;
    }
}
