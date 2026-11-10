package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import com.aldia.dominio.excepcion.ComentarioNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Comentario;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.ComentariosCasoDeUso;
import com.aldia.dominio.puerto.salida.ComentarioRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.ReglasInteraccion;

/** Comentarios de las noticias (HU MF03_001). */
public class ComentariosServicio implements ComentariosCasoDeUso {

    private final ComentarioRepositorioPuerto comentarios;
    private final NoticiaRepositorioPuerto noticias;
    private final UsuarioRepositorioPuerto usuarios;
    private final NotificacionRepositorioPuerto notificaciones;
    private final HistorialRepositorioPuerto historial;
    private final EjecutorTransaccionalPuerto transaccion;
    private final ReglasInteraccion reglas;
    private final Clock reloj;

    @SuppressWarnings("java:S107") // Caso de uso que orquesta varias reglas: recibe un puerto por cada una.
    public ComentariosServicio(ComentarioRepositorioPuerto comentarios, NoticiaRepositorioPuerto noticias,
                               UsuarioRepositorioPuerto usuarios, NotificacionRepositorioPuerto notificaciones,
                               HistorialRepositorioPuerto historial, EjecutorTransaccionalPuerto transaccion,
                               ReglasInteraccion reglas, Clock reloj) {
        this.comentarios = comentarios;
        this.noticias = noticias;
        this.usuarios = usuarios;
        this.notificaciones = notificaciones;
        this.historial = historial;
        this.transaccion = transaccion;
        this.reglas = reglas;
        this.reloj = reloj;
    }

    @Override
    public List<Comentario> listar(Long noticiaId) {
        publicada(noticiaId);
        return comentarios.listarDeNoticia(noticiaId, reglas.parametros().maximoComentariosListado());
    }

    @Override
    public Comentario comentar(String correo, Long noticiaId, String contenido) {
        String limpio = reglas.comentarioValido(contenido);
        return transaccion.ejecutar(() -> {
            Usuario autor = usuarioActivo(usuarios, correo);
            Noticia noticia = publicada(noticiaId);
            LocalDateTime ahora = LocalDateTime.now(reloj);
            Comentario guardado = comentarios.guardar(noticiaId, autor.getId(), limpio, ahora);
            historial.registrar(autor.getId(), AccionHistorial.COMENTARIO, "Comentó la noticia " + noticiaId, ahora);
            reglas.avisoComentario(noticia, autor, ahora).ifPresent(aviso -> notificaciones.guardarTodas(List.of(aviso)));
            return guardado;
        });
    }

    @Override
    public void borrar(String correo, Long noticiaId, Long comentarioId) {
        transaccion.ejecutar(() -> {
            Usuario quien = usuarios.buscarPorCorreo(correo).orElseThrow(UsuarioNoEncontradoExcepcion::new);
            Comentario comentario = comentarios.buscarPorId(comentarioId)
                    .filter(c -> c.noticiaId().equals(noticiaId))
                    .orElseThrow(ComentarioNoEncontradoExcepcion::new);
            reglas.verificarPuedeBorrarComentario(quien, comentario.usuarioId());
            comentarios.borrar(comentarioId);
            return null;
        });
    }

    private Noticia publicada(Long noticiaId) {
        return noticias.buscarPublicadaPorId(noticiaId).orElseThrow(NoticiaNoEncontradaExcepcion::new);
    }

    /** El usuario de la sesión, que debe tener la cuenta activa para interactuar. */
    static Usuario usuarioActivo(UsuarioRepositorioPuerto usuarios, String correo) {
        Usuario usuario = usuarios.buscarPorCorreo(correo).orElseThrow(UsuarioNoEncontradoExcepcion::new);
        if (!usuario.isActivo()) {
            throw new CuentaDesactivadaExcepcion();
        }
        return usuario;
    }
}
