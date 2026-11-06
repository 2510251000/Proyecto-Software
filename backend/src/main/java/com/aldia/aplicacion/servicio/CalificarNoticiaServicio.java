package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.CalificacionPropia;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.CalificarNoticiaCasoDeUso;
import com.aldia.dominio.puerto.salida.CalificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.ReglasInteraccion;

/** Calificaciones de 1 a 5 (HU MF03_002). Una por usuario y noticia; si cambia de opinión, se actualiza. */
public class CalificarNoticiaServicio implements CalificarNoticiaCasoDeUso {

    private final CalificacionRepositorioPuerto calificaciones;
    private final NoticiaRepositorioPuerto noticias;
    private final UsuarioRepositorioPuerto usuarios;
    private final NotificacionRepositorioPuerto notificaciones;
    private final HistorialRepositorioPuerto historial;
    private final EjecutorTransaccionalPuerto transaccion;
    private final ReglasInteraccion reglas;
    private final Clock reloj;

    @SuppressWarnings("java:S107") // Caso de uso que orquesta varias reglas: recibe un puerto por cada una.
    public CalificarNoticiaServicio(CalificacionRepositorioPuerto calificaciones, NoticiaRepositorioPuerto noticias,
                                    UsuarioRepositorioPuerto usuarios, NotificacionRepositorioPuerto notificaciones,
                                    HistorialRepositorioPuerto historial, EjecutorTransaccionalPuerto transaccion,
                                    ReglasInteraccion reglas, Clock reloj) {
        this.calificaciones = calificaciones;
        this.noticias = noticias;
        this.usuarios = usuarios;
        this.notificaciones = notificaciones;
        this.historial = historial;
        this.transaccion = transaccion;
        this.reglas = reglas;
        this.reloj = reloj;
    }

    @Override
    public CalificacionPropia calificar(String correo, Long noticiaId, Integer valor) {
        return transaccion.ejecutar(() -> {
            Usuario quien = ComentariosServicio.usuarioActivo(usuarios, correo);
            Noticia noticia = noticias.buscarPublicadaPorId(noticiaId).orElseThrow(NoticiaNoEncontradaExcepcion::new);
            reglas.verificarCalificacion(quien, noticia, valor);

            LocalDateTime ahora = LocalDateTime.now(reloj);
            Optional<Integer> anterior = calificaciones.buscar(quien.getId(), noticiaId);
            calificaciones.guardar(quien.getId(), noticiaId, valor, ahora);
            historial.registrar(quien.getId(), AccionHistorial.CALIFICACION,
                    "Calificó con " + valor + " la noticia " + noticiaId, ahora);
            // Solo se avisa la primera vez: cambiar de opinión no vuelve a notificar al autor.
            if (anterior.isEmpty()) {
                reglas.avisoCalificacion(noticia, quien, valor, ahora)
                        .ifPresent(aviso -> notificaciones.guardarTodas(List.of(aviso)));
            }
            return new CalificacionPropia(calificaciones.resumen(noticiaId), valor);
        });
    }

    @Override
    public Map<Long, Integer> misCalificaciones(String correo, List<Long> noticiaIds) {
        if (correo == null || noticiaIds.isEmpty()) {
            return Map.of();
        }
        return usuarios.buscarPorCorreo(correo)
                .map(usuario -> calificaciones.delUsuario(usuario.getId(), noticiaIds))
                .orElse(Map.of());
    }
}
