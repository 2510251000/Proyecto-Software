package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.LimiteDiarioAlcanzadoExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.PublicarNoticiaCasoDeUso;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@Service
public class PublicarNoticiaServicio implements PublicarNoticiaCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final CiudadRepositorioPuerto ciudadRepositorioPuerto;
    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;
    private final HistorialRepositorioPuerto historialRepositorioPuerto;
    private final Clock reloj;

    public PublicarNoticiaServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                   CiudadRepositorioPuerto ciudadRepositorioPuerto,
                                   NoticiaRepositorioPuerto noticiaRepositorioPuerto,
                                   HistorialRepositorioPuerto historialRepositorioPuerto,
                                   Clock reloj) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.ciudadRepositorioPuerto = ciudadRepositorioPuerto;
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
        this.historialRepositorioPuerto = historialRepositorioPuerto;
        this.reloj = reloj;
    }

    /**
     * Guarda la noticia y su registro en historial dentro de una sola transacción:
     * si algo falla, no queda ninguna de las dos cosas a medias.
     */
    @Override
    @Transactional
    public Noticia publicar(String correoAutor, NuevaNoticia datos) {
        Usuario autor = usuarioRepositorioPuerto.buscarPorCorreo(correoAutor)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);

        if (!autor.isActivo()) {
            throw new CuentaDesactivadaExcepcion();
        }

        if (!ciudadRepositorioPuerto.existePorId(datos.ciudadId())) {
            throw new CiudadNoEncontradaExcepcion();
        }

        // La fecha la pone el backend con el mismo reloj con el que se cuenta el límite.
        LocalDateTime ahora = LocalDateTime.now(reloj);
        LocalDateTime inicioDelDia = ahora.toLocalDate().atStartOfDay();

        int limite = autor.getNivel().getLimiteNoticiasDiarias();
        long publicadasHoy = noticiaRepositorioPuerto.contarDelAutorDesde(autor.getId(), inicioDelDia);
        if (publicadasHoy >= limite) {
            throw new LimiteDiarioAlcanzadoExcepcion(limite, autor.getNivel().getNombre());
        }

        boolean oficial = autor.getRol() == Usuario.Rol.ADMINISTRADOR;
        Noticia publicada = noticiaRepositorioPuerto.guardarNueva(datos, autor.getId(), oficial, ahora);

        historialRepositorioPuerto.registrar(autor.getId(), AccionHistorial.PUBLICACION,
                "Publicó la noticia " + publicada.getId(), ahora);

        return publicada;
    }
}
