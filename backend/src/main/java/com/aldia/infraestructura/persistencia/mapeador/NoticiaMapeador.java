package com.aldia.infraestructura.persistencia.mapeador;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;
import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;

@Component
public class NoticiaMapeador {

    public Noticia aDominio(NoticiaEntidad entidad) {
        String ciudad = entidad.getCiudad() != null ? entidad.getCiudad().getNombre() : null;
        Long ciudadId = entidad.getCiudad() != null ? entidad.getCiudad().getId() : null;
        Noticia.Estado estado = entidad.getEstado() != null
                ? Noticia.Estado.valueOf(entidad.getEstado().name())
                : null;

        UsuarioEntidad autor = entidad.getUsuario();
        Long autorId = autor != null ? autor.getId() : null;
        String autorNombre = autor != null ? nombreVisible(autor) : null;
        int autorNivel = autor != null && autor.getNivel() != null ? autor.getNivel().getNumero() : 1;

        return new Noticia(
                entidad.getId(),
                entidad.getTitulo(),
                entidad.getResumen(),
                entidad.getContenido(),
                entidad.getFechaPublicacion(),
                entidad.isOficial(),
                estado,
                ciudad,
                ciudadId,
                autorId,
                autorNombre,
                autorNivel,
                entidad.getLatitud(),
                entidad.getLongitud()
        );
    }

    /** Nombre si lo tiene; si no, lo que va antes de la @ del correo (el correo completo no se publica). */
    private static String nombreVisible(UsuarioEntidad autor) {
        if (autor.getNombre() != null && !autor.getNombre().isBlank()) {
            return autor.getNombre();
        }
        String correo = autor.getCorreo();
        int arroba = correo == null ? -1 : correo.indexOf('@');
        return arroba > 0 ? correo.substring(0, arroba) : correo;
    }
}
