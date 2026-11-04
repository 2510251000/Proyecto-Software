package com.aldia.aplicacion.servicio;

import java.util.ArrayList;
import java.util.List;

import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.modelo.ImagenNoticia;
import com.aldia.dominio.modelo.ImagenProcesada;
import com.aldia.dominio.modelo.ImagenSubida;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;
import com.aldia.dominio.puerto.salida.ProcesadorImagenesPuerto;
import com.aldia.dominio.servicio.ValidadorImagenes;

/**
 * Prepara y guarda los archivos de las fotos al publicar: valida, quita los metadatos y los
 * deja en el almacén. Si algo falla a mitad de camino, borra lo que alcanzó a guardar.
 */
public class ArchivosDeImagenes {

    /** Foto lista para guardar, con su descripción. */
    public record FotoPreparada(ImagenProcesada imagen, String textoAlternativo) {
    }

    private final ValidadorImagenes validador;
    private final ProcesadorImagenesPuerto procesador;
    private final AlmacenImagenesPuerto almacen;

    public ArchivosDeImagenes(ValidadorImagenes validador, ProcesadorImagenesPuerto procesador,
                              AlmacenImagenesPuerto almacen) {
        this.validador = validador;
        this.procesador = procesador;
        this.almacen = almacen;
    }

    /** Valida cantidad, peso, tipo real y dimensiones, y deja cada foto sin metadatos. */
    public List<FotoPreparada> preparar(List<ImagenSubida> imagenes) {
        List<FormatoImagen> formatos = validador.validar(imagenes);
        List<FotoPreparada> preparadas = new ArrayList<>(imagenes.size());
        for (int i = 0; i < imagenes.size(); i++) {
            ImagenSubida subida = imagenes.get(i);
            FormatoImagen formato = formatos.get(i);
            String texto = validador.textoAlternativo(subida.textoAlternativo());
            validador.validarDimensiones(procesador.medir(subida.contenido(), formato), subida.nombreArchivo());
            byte[] limpia = procesador.limpiar(subida.contenido(), formato);
            preparadas.add(new FotoPreparada(new ImagenProcesada(limpia, formato), texto));
        }
        return preparadas;
    }

    /** Guarda los archivos en orden (1, 2, 3…). Si uno falla, borra los anteriores. */
    public List<ImagenNoticia> guardar(List<FotoPreparada> fotos) {
        List<ImagenNoticia> guardadas = new ArrayList<>(fotos.size());
        try {
            for (FotoPreparada foto : fotos) {
                String clave = almacen.guardar(foto.imagen().contenido(), foto.imagen().formato().extension());
                guardadas.add(new ImagenNoticia(guardadas.size() + 1, clave, foto.textoAlternativo()));
            }
        } catch (RuntimeException error) {
            borrar(guardadas);
            throw error;
        }
        return guardadas;
    }

    /** Borra los archivos (se usa cuando la publicación no se pudo completar). */
    public void borrar(List<ImagenNoticia> imagenes) {
        for (ImagenNoticia imagen : imagenes) {
            try {
                almacen.borrar(imagen.clave());
            } catch (RuntimeException ignorada) {
                // Se intenta con las demás: un archivo huérfano no debe tapar el error original.
            }
        }
    }
}
