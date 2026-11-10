package com.aldia.dominio.servicio;

import java.util.List;
import java.util.Optional;

import com.aldia.dominio.excepcion.ImagenInvalidaExcepcion;
import com.aldia.dominio.modelo.DimensionesImagen;
import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.modelo.ImagenSubida;
import com.aldia.dominio.modelo.ParametrosImagenes;

/**
 * Reglas de las fotos de una noticia: cuántas, cuánto pesan, qué son de verdad (por sus
 * primeros bytes, nunca por el nombre ni por lo que diga el navegador) y qué tan grandes son.
 */
public class ValidadorImagenes {

    private static final long BYTES_POR_MB = 1024L * 1024L;

    private final ParametrosImagenes parametros;

    public ValidadorImagenes(ParametrosImagenes parametros) {
        this.parametros = parametros;
    }

    public ParametrosImagenes parametros() {
        return parametros;
    }

    /**
     * Revisa la cantidad, el peso y el tipo real de cada foto. Devuelve el formato de cada una
     * en el mismo orden.
     */
    public List<FormatoImagen> validar(List<ImagenSubida> imagenes) {
        if (imagenes.size() > parametros.maximoPorNoticia()) {
            throw new ImagenInvalidaExcepcion("Puedes subir máximo " + parametros.maximoPorNoticia()
                    + " fotos por noticia");
        }
        return imagenes.stream().map(this::validarUna).toList();
    }

    /** Que la foto no pase de las dimensiones permitidas (se revisa antes de decodificarla). */
    public void validarDimensiones(DimensionesImagen imagen, String nombreArchivo) {
        if (imagen.ancho() <= 0 || imagen.alto() <= 0) {
            throw new ImagenInvalidaExcepcion(prefijo(nombreArchivo) + "no tiene un tamaño válido");
        }
        if (imagen.ancho() > parametros.anchoMaximo() || imagen.alto() > parametros.altoMaximo()) {
            throw new ImagenInvalidaExcepcion(prefijo(nombreArchivo) + "mide " + imagen.ancho() + "×" + imagen.alto()
                    + " píxeles; el máximo es " + parametros.anchoMaximo() + "×" + parametros.altoMaximo());
        }
    }

    /** Texto alternativo limpio: sin espacios sobrantes y sin pasar del largo permitido. */
    public String textoAlternativo(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        String limpio = texto.strip().replaceAll("\\s+", " ");
        if (limpio.length() > parametros.largoMaximoTextoAlternativo()) {
            throw new ImagenInvalidaExcepcion("La descripción de una foto puede tener máximo "
                    + parametros.largoMaximoTextoAlternativo() + " caracteres");
        }
        return limpio;
    }

    private FormatoImagen validarUna(ImagenSubida imagen) {
        if (imagen.tamano() == 0) {
            throw new ImagenInvalidaExcepcion(prefijo(imagen.nombreArchivo()) + "está vacía");
        }
        if (imagen.tamano() > parametros.tamanoMaximoBytes()) {
            throw new ImagenInvalidaExcepcion(prefijo(imagen.nombreArchivo()) + "pesa más de "
                    + parametros.tamanoMaximoBytes() / BYTES_POR_MB + " MB");
        }
        return detectarFormato(imagen.contenido()).orElseThrow(() -> new ImagenInvalidaExcepcion(
                prefijo(imagen.nombreArchivo()) + "no es una imagen JPEG, PNG o WebP"));
    }

    /** El formato según la «firma» de los primeros bytes del archivo. */
    public static Optional<FormatoImagen> detectarFormato(byte[] bytes) {
        if (empiezaCon(bytes, 0, 0xFF, 0xD8, 0xFF)) {
            return Optional.of(FormatoImagen.JPEG);
        }
        if (empiezaCon(bytes, 0, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)) {
            return Optional.of(FormatoImagen.PNG);
        }
        if (empiezaCon(bytes, 0, 'R', 'I', 'F', 'F') && empiezaCon(bytes, 8, 'W', 'E', 'B', 'P')) {
            return Optional.of(FormatoImagen.WEBP);
        }
        return Optional.empty();
    }

    private static boolean empiezaCon(byte[] bytes, int desde, int... firma) {
        if (bytes.length < desde + firma.length) {
            return false;
        }
        for (int i = 0; i < firma.length; i++) {
            if ((bytes[desde + i] & 0xFF) != firma[i]) {
                return false;
            }
        }
        return true;
    }

    private static String prefijo(String nombreArchivo) {
        return nombreArchivo == null || nombreArchivo.isBlank()
                ? "Una de las fotos "
                : "La foto «" + nombreArchivo + "» ";
    }
}
