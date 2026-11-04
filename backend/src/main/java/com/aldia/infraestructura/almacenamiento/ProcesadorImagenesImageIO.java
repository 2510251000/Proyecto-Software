package com.aldia.infraestructura.almacenamiento;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.aldia.dominio.excepcion.ImagenInvalidaExcepcion;
import com.aldia.dominio.modelo.DimensionesImagen;
import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.puerto.salida.ProcesadorImagenesPuerto;

/**
 * Procesa las fotos con ImageIO, que viene con Java. JPEG y PNG se vuelven a codificar desde
 * los píxeles: el archivo nuevo no lleva EXIF (ubicación GPS, modelo del celular…), ni XMP, ni
 * comentarios. WebP no lo trae Java: se le quitan los bloques de metadatos sin recodificarlo.
 */
@Component
public class ProcesadorImagenesImageIO implements ProcesadorImagenesPuerto {

    private final float calidadJpeg;

    public ProcesadorImagenesImageIO(@Value("${aldia.imagenes.calidad-jpeg}") float calidadJpeg) {
        this.calidadJpeg = calidadJpeg;
    }

    @Override
    public DimensionesImagen medir(byte[] contenido, FormatoImagen formato) {
        if (formato == FormatoImagen.WEBP) {
            return WebpSinMetadatos.medir(contenido);
        }
        try (ImageInputStream entrada = ImageIO.createImageInputStream(new ByteArrayInputStream(contenido))) {
            ImageReader lector = lectorPara(formato);
            try {
                lector.setInput(entrada, true, true);
                return new DimensionesImagen(lector.getWidth(0), lector.getHeight(0));
            } finally {
                lector.dispose();
            }
        } catch (IOException | RuntimeException error) {
            throw noSePudoLeer(formato);
        }
    }

    @Override
    public byte[] limpiar(byte[] contenido, FormatoImagen formato) {
        if (formato == FormatoImagen.WEBP) {
            return WebpSinMetadatos.limpiar(contenido);
        }
        BufferedImage imagen = leer(contenido, formato);
        try {
            return formato == FormatoImagen.JPEG ? escribirJpeg(imagen) : escribirPng(imagen);
        } catch (IOException error) {
            throw noSePudoLeer(formato);
        }
    }

    private static BufferedImage leer(byte[] contenido, FormatoImagen formato) {
        try {
            BufferedImage imagen = ImageIO.read(new ByteArrayInputStream(contenido));
            if (imagen == null) {
                throw noSePudoLeer(formato);
            }
            return imagen;
        } catch (IOException | RuntimeException error) {
            throw noSePudoLeer(formato);
        }
    }

    private byte[] escribirJpeg(BufferedImage original) throws IOException {
        // JPEG no tiene transparencia: se pasa a RGB por si llegó con canal alfa.
        BufferedImage rgb = original;
        if (original.getType() != BufferedImage.TYPE_INT_RGB && original.getType() != BufferedImage.TYPE_3BYTE_BGR) {
            rgb = new BufferedImage(original.getWidth(), original.getHeight(), BufferedImage.TYPE_INT_RGB);
            rgb.createGraphics().drawImage(original, 0, 0, java.awt.Color.WHITE, null);
        }
        ImageWriter escritor = ImageIO.getImageWritersByFormatName("jpeg").next();
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        try (ImageOutputStream flujo = ImageIO.createImageOutputStream(salida)) {
            escritor.setOutput(flujo);
            ImageWriteParam parametros = escritor.getDefaultWriteParam();
            parametros.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            parametros.setCompressionQuality(calidadJpeg);
            escritor.write(null, new IIOImage(rgb, null, null), parametros);
        } finally {
            escritor.dispose();
        }
        return salida.toByteArray();
    }

    private static byte[] escribirPng(BufferedImage imagen) throws IOException {
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        ImageIO.write(imagen, "png", salida);
        return salida.toByteArray();
    }

    private static ImageReader lectorPara(FormatoImagen formato) {
        Iterator<ImageReader> lectores = ImageIO.getImageReadersByFormatName(formato == FormatoImagen.PNG ? "png" : "jpeg");
        if (!lectores.hasNext()) {
            throw noSePudoLeer(formato);
        }
        return lectores.next();
    }

    private static ImagenInvalidaExcepcion noSePudoLeer(FormatoImagen formato) {
        return new ImagenInvalidaExcepcion("No se pudo leer la foto como " + formato.name()
                + ": puede estar dañada. Prueba guardándola de nuevo como JPEG o PNG");
    }
}
