package com.aldia.dominio;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import com.aldia.dominio.modelo.DimensionesImagen;
import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.modelo.ImagenSubida;
import com.aldia.dominio.modelo.ParametrosImagenes;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;
import com.aldia.dominio.puerto.salida.ProcesadorImagenesPuerto;

/** Piezas de prueba para las fotos: almacén en memoria, procesador falso y bytes con firma real. */
public final class ImagenesDePrueba {

    public static final ParametrosImagenes PARAMETROS = new ParametrosImagenes(4, 1024, 4000, 3000, 250);

    private ImagenesDePrueba() {
    }

    /** Bytes que empiezan con la firma de un JPEG (FF D8 FF) seguidos de relleno. */
    public static byte[] jpeg(int tamano) {
        byte[] bytes = new byte[tamano];
        Arrays.fill(bytes, (byte) 7);
        bytes[0] = (byte) 0xFF;
        bytes[1] = (byte) 0xD8;
        bytes[2] = (byte) 0xFF;
        return bytes;
    }

    public static ImagenSubida foto(String nombre) {
        return new ImagenSubida(nombre, jpeg(100), "Descripción de " + nombre);
    }

    /** Guarda en un mapa; puede fallar a propósito desde el guardado número N. */
    public static class AlmacenEnMemoria implements AlmacenImagenesPuerto {

        public final Map<String, byte[]> archivos = new LinkedHashMap<>();
        private int contador;
        private int fallarDesde = Integer.MAX_VALUE;

        public void fallarDesdeElGuardado(int numero) {
            this.fallarDesde = numero;
        }

        @Override
        public String guardar(byte[] contenido, String extension) {
            contador++;
            if (contador >= fallarDesde) {
                throw new IllegalStateException("disco lleno");
            }
            String clave = "archivo-" + contador + "." + extension;
            archivos.put(clave, contenido);
            return clave;
        }

        @Override
        public Optional<byte[]> leer(String clave) {
            return Optional.ofNullable(archivos.get(clave));
        }

        @Override
        public void borrar(String clave) {
            archivos.remove(clave);
        }
    }

    /** Devuelve siempre las mismas dimensiones y los mismos bytes. */
    public static class ProcesadorFalso implements ProcesadorImagenesPuerto {

        private final DimensionesImagen dimensiones;

        public ProcesadorFalso(int ancho, int alto) {
            this.dimensiones = new DimensionesImagen(ancho, alto);
        }

        @Override
        public DimensionesImagen medir(byte[] contenido, FormatoImagen formato) {
            return dimensiones;
        }

        @Override
        public byte[] limpiar(byte[] contenido, FormatoImagen formato) {
            return contenido;
        }
    }
}
