package com.aldia.infraestructura.almacenamiento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.zip.CRC32;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import com.aldia.dominio.excepcion.ImagenInvalidaExcepcion;
import com.aldia.dominio.modelo.DimensionesImagen;
import com.aldia.dominio.modelo.FormatoImagen;

/**
 * Lo importante: una foto del celular trae en el EXIF la ubicación GPS exacta de donde se tomó
 * (muchas veces la casa del usuario). Después de procesarla, no debe quedar rastro.
 */
class ProcesadorImagenesImageIOTest {

    private static final String SECRETO = "GPS 4.3372N 74.3639W CASA DE LAURA";

    private final ProcesadorImagenesImageIO procesador = new ProcesadorImagenesImageIO(0.85f);

    private static byte[] imagen(String formato, int ancho, int alto, int tipo) throws IOException {
        BufferedImage imagen = new BufferedImage(ancho, alto, tipo);
        imagen.setRGB(1, 1, 0xFFAA3300);
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        ImageIO.write(imagen, formato, salida);
        return salida.toByteArray();
    }

    /** Mete un segmento APP1 «Exif» (como el de un celular) justo después del inicio del JPEG. */
    private static byte[] conExif(byte[] jpeg) {
        byte[] carga = ("Exif\0\0" + SECRETO).getBytes(StandardCharsets.ISO_8859_1);
        ByteBuffer salida = ByteBuffer.allocate(jpeg.length + 4 + carga.length);
        salida.put(jpeg, 0, 2);
        salida.put((byte) 0xFF).put((byte) 0xE1).putShort((short) (carga.length + 2)).put(carga);
        salida.put(jpeg, 2, jpeg.length - 2);
        return salida.array();
    }

    /** Mete un bloque de texto (tEXt) con el secreto antes del final del PNG. */
    private static byte[] conTexto(byte[] png) {
        byte[] tipoYDatos = ("tEXt" + "Comment\0" + SECRETO).getBytes(StandardCharsets.ISO_8859_1);
        CRC32 crc = new CRC32();
        crc.update(tipoYDatos);
        int iend = png.length - 12;
        ByteBuffer salida = ByteBuffer.allocate(png.length + 8 + tipoYDatos.length);
        salida.put(png, 0, iend);
        salida.putInt(tipoYDatos.length - 4).put(tipoYDatos).putInt((int) crc.getValue());
        salida.put(png, iend, 12);
        return salida.array();
    }

    private static boolean contiene(byte[] bytes, String texto) {
        return new String(bytes, StandardCharsets.ISO_8859_1).contains(texto);
    }

    @Test
    void alJpegLeQuitaElExifConLaUbicacion() throws IOException {
        byte[] original = conExif(imagen("jpeg", 40, 30, BufferedImage.TYPE_INT_RGB));
        assertThat(contiene(original, SECRETO)).isTrue();

        byte[] limpio = procesador.limpiar(original, FormatoImagen.JPEG);

        assertThat(contiene(limpio, SECRETO)).isFalse();
        assertThat(contiene(limpio, "Exif")).isFalse();
        BufferedImage leida = ImageIO.read(new ByteArrayInputStream(limpio));
        assertThat(leida.getWidth()).isEqualTo(40);
        assertThat(procesador.medir(original, FormatoImagen.JPEG)).isEqualTo(new DimensionesImagen(40, 30));
    }

    @Test
    void alPngLeQuitaLosTextosYConservaLaTransparencia() throws IOException {
        byte[] original = conTexto(imagen("png", 20, 10, BufferedImage.TYPE_INT_ARGB));
        assertThat(contiene(original, SECRETO)).isTrue();

        byte[] limpio = procesador.limpiar(original, FormatoImagen.PNG);

        assertThat(contiene(limpio, SECRETO)).isFalse();
        assertThat(ImageIO.read(new ByteArrayInputStream(limpio)).getColorModel().hasAlpha()).isTrue();
        assertThat(procesador.medir(limpio, FormatoImagen.PNG)).isEqualTo(new DimensionesImagen(20, 10));
    }

    @Test
    void unPngConTransparenciaQueSeGuardaComoJpegQuedaConFondoBlanco() throws IOException {
        byte[] png = imagen("png", 8, 8, BufferedImage.TYPE_INT_ARGB);

        byte[] jpeg = procesador.limpiar(png, FormatoImagen.JPEG);

        assertThat(jpeg[0] & 0xFF).isEqualTo(0xFF);
        assertThat(jpeg[1] & 0xFF).isEqualTo(0xD8);
    }

    @Test
    void unArchivoDanadoSeRechazaConUnMensajeClaro() {
        byte[] danado = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1, 2, 3};

        assertThatThrownBy(() -> procesador.limpiar(danado, FormatoImagen.JPEG))
                .isInstanceOf(ImagenInvalidaExcepcion.class)
                .hasMessageContaining("No se pudo leer la foto como JPEG");
        assertThatThrownBy(() -> procesador.medir(danado, FormatoImagen.JPEG))
                .isInstanceOf(ImagenInvalidaExcepcion.class);
    }

    // ------------------------------------------------------------------ WebP

    private static byte[] bloque(String tipo, byte[] datos) {
        int relleno = datos.length & 1;
        ByteBuffer b = ByteBuffer.allocate(8 + datos.length + relleno).order(ByteOrder.LITTLE_ENDIAN);
        b.put(tipo.getBytes(StandardCharsets.US_ASCII)).putInt(datos.length).put(datos);
        return b.array();
    }

    private static byte[] webp(byte[]... bloques) {
        ByteArrayOutputStream cuerpo = new ByteArrayOutputStream();
        for (byte[] b : bloques) {
            cuerpo.writeBytes(b);
        }
        ByteBuffer salida = ByteBuffer.allocate(12 + cuerpo.size()).order(ByteOrder.LITTLE_ENDIAN);
        salida.put("RIFF".getBytes(StandardCharsets.US_ASCII)).putInt(4 + cuerpo.size())
                .put("WEBP".getBytes(StandardCharsets.US_ASCII)).put(cuerpo.toByteArray());
        return salida.array();
    }

    /** VP8X: banderas (con EXIF y XMP), 3 bytes reservados, ancho-1 y alto-1 en 24 bits. */
    private static byte[] vp8x(int ancho, int alto) {
        byte[] d = new byte[10];
        d[0] = 0x08 | 0x04;
        d[4] = (byte) (ancho - 1);
        d[5] = (byte) ((ancho - 1) >> 8);
        d[7] = (byte) (alto - 1);
        d[8] = (byte) ((alto - 1) >> 8);
        return bloque("VP8X", d);
    }

    private static byte[] vp8(int ancho, int alto) {
        byte[] d = new byte[10];
        d[3] = (byte) 0x9D;
        d[4] = 0x01;
        d[5] = 0x2A;
        d[6] = (byte) ancho;
        d[7] = (byte) (ancho >> 8);
        d[8] = (byte) alto;
        d[9] = (byte) (alto >> 8);
        return bloque("VP8 ", d);
    }

    private static byte[] vp8l(int ancho, int alto) {
        int bits = (ancho - 1) | (alto - 1) << 14;
        byte[] d = {0x2F, (byte) bits, (byte) (bits >> 8), (byte) (bits >> 16), (byte) (bits >> 24), 0, 0, 0, 0, 0};
        return bloque("VP8L", d);
    }

    @Test
    void alWebpLeQuitaLosBloquesExifYXmpSinTocarLaImagen() {
        byte[] imagen = vp8(320, 240);
        byte[] original = webp(vp8x(320, 240), imagen,
                bloque("EXIF", SECRETO.getBytes(StandardCharsets.US_ASCII)),
                bloque("XMP ", "<x:xmpmeta/>".getBytes(StandardCharsets.US_ASCII)));

        byte[] limpio = procesador.limpiar(original, FormatoImagen.WEBP);

        assertThat(contiene(limpio, SECRETO)).isFalse();
        assertThat(contiene(limpio, "xmpmeta")).isFalse();
        assertThat(contiene(limpio, "VP8 ")).isTrue();
        assertThat(limpio[20] & 0x0C).as("banderas de EXIF y XMP apagadas").isZero();
        int tamanoRiff = ByteBuffer.wrap(limpio, 4, 4).order(ByteOrder.LITTLE_ENDIAN).getInt();
        assertThat(tamanoRiff).isEqualTo(limpio.length - 8);
        assertThat(procesador.medir(limpio, FormatoImagen.WEBP)).isEqualTo(new DimensionesImagen(320, 240));
    }

    @Test
    void leeLasDimensionesDeWebpConPerdidaYSinPerdida() {
        assertThat(procesador.medir(webp(vp8(640, 480)), FormatoImagen.WEBP)).isEqualTo(new DimensionesImagen(640, 480));
        assertThat(procesador.medir(webp(bloque("ICCP", new byte[3]), vp8l(100, 50)), FormatoImagen.WEBP))
                .isEqualTo(new DimensionesImagen(100, 50));
    }

    @Test
    void unWebpDanadoSeRechaza() {
        byte[] sinImagen = webp(bloque("EXIF", new byte[4]));
        byte[] truncado = webp(bloque("VP8 ", new byte[4]));
        byte[] noEsWebp = "RIFF0000AVI LIST0000".getBytes(StandardCharsets.US_ASCII);

        assertThatThrownBy(() -> procesador.medir(sinImagen, FormatoImagen.WEBP)).isInstanceOf(ImagenInvalidaExcepcion.class);
        assertThatThrownBy(() -> procesador.medir(truncado, FormatoImagen.WEBP)).isInstanceOf(ImagenInvalidaExcepcion.class);
        assertThatThrownBy(() -> procesador.limpiar(noEsWebp, FormatoImagen.WEBP)).isInstanceOf(ImagenInvalidaExcepcion.class);
    }
}
