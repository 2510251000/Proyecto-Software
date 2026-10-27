package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.NuevaNoticia;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.PublicarNoticiaCasoDeUso;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;
import com.aldia.dominio.servicio.CalculadoraNivel;
import com.aldia.dominio.servicio.ReglaLimiteDiario;

public class PublicarNoticiaServicio implements PublicarNoticiaCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final CiudadRepositorioPuerto ciudadRepositorioPuerto;
    private final NoticiaRepositorioPuerto noticiaRepositorioPuerto;
    private final HistorialRepositorioPuerto historialRepositorioPuerto;
    private final NivelRepositorioPuerto nivelRepositorioPuerto;
    private final NotificacionRepositorioPuerto notificacionRepositorioPuerto;
    private final EjecutorTransaccionalPuerto transaccion;
    private final ReglaLimiteDiario reglaLimiteDiario;
    private final CalculadoraNivel calculadoraNivel;
    private final AvisosPorCiudad avisosPorCiudad;
    private final Clock reloj;

    public PublicarNoticiaServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                   CiudadRepositorioPuerto ciudadRepositorioPuerto,
                                   NoticiaRepositorioPuerto noticiaRepositorioPuerto,
                                   HistorialRepositorioPuerto historialRepositorioPuerto,
                                   NivelRepositorioPuerto nivelRepositorioPuerto,
                                   NotificacionRepositorioPuerto notificacionRepositorioPuerto,
                                   EjecutorTransaccionalPuerto transaccion,
                                   ReglaLimiteDiario reglaLimiteDiario,
                                   CalculadoraNivel calculadoraNivel,
                                   AvisosPorCiudad avisosPorCiudad,
                                   Clock reloj) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.ciudadRepositorioPuerto = ciudadRepositorioPuerto;
        this.noticiaRepositorioPuerto = noticiaRepositorioPuerto;
        this.historialRepositorioPuerto = historialRepositorioPuerto;
        this.nivelRepositorioPuerto = nivelRepositorioPuerto;
        this.notificacionRepositorioPuerto = notificacionRepositorioPuerto;
        this.transaccion = transaccion;
        this.reglaLimiteDiario = reglaLimiteDiario;
        this.calculadoraNivel = calculadoraNivel;
        this.avisosPorCiudad = avisosPorCiudad;
        this.reloj = reloj;
    }

    /**
     * Guarda la noticia, su registro en historial, los puntos del autor y los avisos a
     * los vecinos dentro de una sola transacción: si algo falla, no queda nada a medias.
     */
    @Override
    public Noticia publicar(String correoAutor, NuevaNoticia datos) {
        return transaccion.ejecutar(() -> publicarEnTransaccion(correoAutor, datos));
    }

    private Noticia publicarEnTransaccion(String correoAutor, NuevaNoticia datos) {
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

        long publicadasHoy = noticiaRepositorioPuerto.contarDelAutorDesde(autor.getId(), inicioDelDia);
        reglaLimiteDiario.verificar(autor, publicadasHoy);

        boolean oficial = autor.esAdministrador();
        Noticia publicada = noticiaRepositorioPuerto.guardarNueva(datos, autor.getId(), oficial, ahora);

        historialRepositorioPuerto.registrar(autor.getId(), AccionHistorial.PUBLICACION,
                "Publicó la noticia " + publicada.getId(), ahora);

        // Avisos a quienes viven en la ciudad de la noticia (el autor no se avisa a sí mismo).
        List<Long> vecinos = usuarioRepositorioPuerto.idsActivosEnCiudad(datos.ciudadId());
        notificacionRepositorioPuerto.guardarTodas(
                avisosPorCiudad.paraNoticiaNueva(conAutor(publicada, autor), vecinos, ahora));

        if (!oficial) {
            sumarPuntos(autor, ahora);
        }

        return publicada;
    }

    private void sumarPuntos(Usuario autor, LocalDateTime ahora) {
        List<Nivel> niveles = nivelRepositorioPuerto.listarTodos();
        Usuario actualizado = calculadoraNivel.sumarPublicacion(autor, niveles);
        usuarioRepositorioPuerto.guardar(actualizado);

        if (CalculadoraNivel.subio(autor, actualizado)) {
            Nivel nuevo = actualizado.getNivel();
            historialRepositorioPuerto.registrar(autor.getId(), AccionHistorial.CAMBIO_NIVEL,
                    "Subió al nivel " + nuevo.getNumero(), ahora);
            notificacionRepositorioPuerto.guardarTodas(List.of(Notificacion.nueva(autor.getId(),
                    TipoNotificacion.ASCENSO_NIVEL,
                    "¡Subiste al nivel " + nuevo.getNumero() + " (" + nuevo.getNombre() + ")! Ahora puedes publicar "
                            + nuevo.getLimiteNoticiasDiarias() + " noticias al día.",
                    null, ahora)));
        }
    }

    /** La noticia guardada con el id del autor, por si el adaptador no lo devolvió. */
    private static Noticia conAutor(Noticia noticia, Usuario autor) {
        return new Noticia(noticia.getId(), noticia.getTitulo(), noticia.getResumen(), noticia.getContenido(),
                noticia.getFechaPublicacion(), noticia.isOficial(), noticia.getEstado(), noticia.getCiudad(),
                noticia.getCiudadId(), autor.getId(), autor.nombreVisible(), autor.getNivel().getNumero(),
                noticia.getLatitud(), noticia.getLongitud());
    }
}
