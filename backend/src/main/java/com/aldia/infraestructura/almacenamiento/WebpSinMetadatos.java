package com.aldia.infraestructura.almacenamiento;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;

import com.aldia.dominio.excepcion.ImagenInvalidaExcepcion;
import com.aldia.dominio.modelo.DimensionesImagen;

/**
 * Lee y limpia archivos WebP sin librerías externas (Java no trae lector de WebP).
 * Un WebP es un contenedor RIFF: «RIFF» + tamaño + «WEBP» y luego bloques (fourcc + tamaño +
 * datos). La imagen va en VP8, VP8L o VP8X; los metadatos en los bloques EXIF y XMP, que aquí
 * se quitan sin tocar la imagen.
 */
final class WebpSinMetadatos {

    private static final int CABECERA_RIFF = 12;
    private static final int CABECERA_BLOQUE = 8;
    /** Bits de la bandera de VP8X que avisan que hay EXIF (0x08) o XMP (0x04). */
    private static final int BANDERAS_METADATOS = 0x08 | 0x04;
    /** Bytes mínimos de un bloque VP8, VP8L o VP8X para leer sus dimensiones. */
    private static final int MINIMO_BLOQUE_IMAGEN = 10;
    private static final String MENSAJE_INVALIDO = "La foto no es un WebP válido";

    private WebpSinMetadatos() {
    }

    static DimensionesImagen medir(byte[] webp) {
        ByteBuffer datos = verificar(webp);
        while (datos.remaining() >= CABECERA_BLOQUE) {
            String tipo = leerTipo(datos);
            int tamano = datos.getInt();
            int inicio = datos.position();
            if (tamano < 0 || tamano > datos.remaining() || (tipo.startsWith("VP8") && tamano < MINIMO_BLOQUE_IMAGEN)) {
                throw new ImagenInvalidaExcepcion(MENSAJE_INVALIDO);
            }
            switch (tipo) {
                case "VP8X" -> {
                    return new DimensionesImagen(entero24(webp, inicio + 4) + 1, entero24(webp, inicio + 7) + 1);
                }
                case "VP8 " -> {
                    int ancho = (webp[inicio + 6] & 0xFF | (webp[inicio + 7] & 0xFF) << 8) & 0x3FFF;
                    int alto = (webp[inicio + 8] & 0xFF | (webp[inicio + 9] & 0xFF) << 8) & 0x3FFF;
                    return new DimensionesImagen(ancho, alto);
                }
                case "VP8L" -> {
                    int bits = webp[inicio + 1] & 0xFF | (webp[inicio + 2] & 0xFF) << 8
                            | (webp[inicio + 3] & 0xFF) << 16 | (webp[inicio + 4] & 0xFF) << 24;
                    return new DimensionesImagen((bits & 0x3FFF) + 1, ((bits >>> 14) & 0x3FFF) + 1);
                }
                default -> datos.position(inicio + tamano + (tamano & 1));
            }
        }
        throw new ImagenInvalidaExcepcion(MENSAJE_INVALIDO);
    }

    static byte[] limpiar(byte[] webp) {
        ByteBuffer datos = verificar(webp);
        ByteArrayOutputStream bloques = new ByteArrayOutputStream(webp.length);
        while (datos.remaining() >= CABECERA_BLOQUE) {
            int inicio = datos.position();
            String tipo = leerTipo(datos);
            int tamano = datos.getInt();
            int conRelleno = tamano + (tamano & 1);
            if (tamano < 0 || conRelleno > datos.remaining()) {
                throw new ImagenInvalidaExcepcion(MENSAJE_INVALIDO);
            }
            datos.position(datos.position() + conRelleno);
            if ("EXIF".equals(tipo) || "XMP ".equals(tipo)) {
                continue;
            }
            byte[] bloque = new byte[CABECERA_BLOQUE + conRelleno];
            System.arraycopy(webp, inicio, bloque, 0, bloque.length);
            if ("VP8X".equals(tipo)) {
                bloque[CABECERA_BLOQUE] = (byte) (bloque[CABECERA_BLOQUE] & ~BANDERAS_METADATOS);
            }
            bloques.writeBytes(bloque);
        }
        byte[] cuerpo = bloques.toByteArray();
        ByteBuffer salida = ByteBuffer.allocate(CABECERA_RIFF + cuerpo.length).order(ByteOrder.LITTLE_ENDIAN);
        salida.put("RIFF".getBytes(StandardCharsets.US_ASCII));
        salida.putInt(4 + cuerpo.length);
        salida.put("WEBP".getBytes(StandardCharsets.US_ASCII));
        salida.put(cuerpo);
        return salida.array();
    }

    private static ByteBuffer verificar(byte[] webp) {
        if (webp.length < CABECERA_RIFF + CABECERA_BLOQUE
                || !"RIFF".equals(new String(webp, 0, 4, StandardCharsets.US_ASCII))
                || !"WEBP".equals(new String(webp, 8, 4, StandardCharsets.US_ASCII))) {
            throw new ImagenInvalidaExcepcion(MENSAJE_INVALIDO);
        }
        return ByteBuffer.wrap(webp).order(ByteOrder.LITTLE_ENDIAN).position(CABECERA_RIFF);
    }

    private static String leerTipo(ByteBuffer datos) {
        byte[] tipo = new byte[4];
        datos.get(tipo);
        return new String(tipo, StandardCharsets.US_ASCII);
    }

    private static int entero24(byte[] bytes, int desde) {
        return bytes[desde] & 0xFF | (bytes[desde + 1] & 0xFF) << 8 | (bytes[desde + 2] & 0xFF) << 16;
    }
}
