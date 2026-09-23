package com.aldia.infraestructura.persistencia.mapeador;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;

@Component
public class NoticiaMapeador {

    public Noticia aDominio(NoticiaEntidad entidad) {
        String ciudad = entidad.getCiudad() != null ? entidad.getCiudad().getNombre() : null;
        Noticia.Estado estado = entidad.getEstado() != null
                ? Noticia.Estado.valueOf(entidad.getEstado().name())
                : null;

        return new Noticia(
                entidad.getId(),
                entidad.getTitulo(),
                entidad.getResumen(),
                entidad.getContenido(),
                entidad.getFechaPublicacion(),
                entidad.isOficial(),
                estado,
                ciudad
        );
    }
}