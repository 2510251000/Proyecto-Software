package com.aldia.aplicacion.servicio;

import org.springframework.stereotype.Service;

import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.ObtenerNoticiaCasoDeUso;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;

@Service
public class ObtenerNoticiaServicio implements ObtenerNoticiaCasoDeUso {

    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;

    public ObtenerNoticiaServicio(NoticiaRepositorioPuerto noticiaRepositorioPuerto) {
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
    }

    /**
     * Solo devuelve noticias PUBLICADAS: una oculta o eliminada responde igual que una inexistente.
     */
    @Override
    public Noticia obtenerPublicada(Long id) {
        return noticiaRepositorioPuerto.buscarPublicadaPorId(id)
                .orElseThrow(NoticiaNoEncontradaExcepcion::new);
    }
}
