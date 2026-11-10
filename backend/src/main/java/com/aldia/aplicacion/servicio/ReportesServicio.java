package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.ReporteDuplicadoExcepcion;
import com.aldia.dominio.excepcion.ReporteNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Reporte;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.ReportesCasoDeUso;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.ReporteRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.ReglasInteraccion;

/** Reportes de noticias y su revisión por el administrador (HU MF03_003). */
public class ReportesServicio implements ReportesCasoDeUso {

    private final ReporteRepositorioPuerto reportes;
    private final NoticiaRepositorioPuerto noticias;
    private final UsuarioRepositorioPuerto usuarios;
    private final HistorialRepositorioPuerto historial;
    private final EjecutorTransaccionalPuerto transaccion;
    private final ReglasInteraccion reglas;
    private final Clock reloj;

    @SuppressWarnings("java:S107") // Caso de uso que orquesta varias reglas: recibe un puerto por cada una.
    public ReportesServicio(ReporteRepositorioPuerto reportes, NoticiaRepositorioPuerto noticias,
                            UsuarioRepositorioPuerto usuarios, HistorialRepositorioPuerto historial,
                            EjecutorTransaccionalPuerto transaccion, ReglasInteraccion reglas, Clock reloj) {
        this.reportes = reportes;
        this.noticias = noticias;
        this.usuarios = usuarios;
        this.historial = historial;
        this.transaccion = transaccion;
        this.reglas = reglas;
        this.reloj = reloj;
    }

    @Override
    public Reporte reportar(String correo, Long noticiaId, MotivoReporte motivo, String descripcion) {
        String limpia = reglas.descripcionReporte(descripcion);
        return transaccion.ejecutar(() -> {
            Usuario quien = ComentariosServicio.usuarioActivo(usuarios, correo);
            noticias.buscarPublicadaPorId(noticiaId).orElseThrow(NoticiaNoEncontradaExcepcion::new);
            if (reportes.existe(quien.getId(), noticiaId)) {
                throw new ReporteDuplicadoExcepcion();
            }
            LocalDateTime ahora = LocalDateTime.now(reloj);
            Reporte guardado = reportes.guardar(noticiaId, quien.getId(), motivo, limpia, ahora);
            historial.registrar(quien.getId(), AccionHistorial.REPORTE,
                    "Reportó la noticia " + noticiaId + " por " + motivo, ahora);
            return guardado;
        });
    }

    @Override
    public List<Reporte> listar(EstadoReporte estado) {
        return reportes.listar(estado, reglas.parametros().maximoReportesListado());
    }

    @Override
    public Reporte cambiarEstado(String correoAdministrador, Long reporteId, EstadoReporte estado) {
        reglas.verificarCambioReporte(estado);
        return transaccion.ejecutar(() -> {
            Usuario administrador = usuarios.buscarPorCorreo(correoAdministrador)
                    .orElseThrow(UsuarioNoEncontradoExcepcion::new);
            if (!administrador.esAdministrador()) {
                throw new AccionNoPermitidaExcepcion("Solo un administrador puede revisar reportes");
            }
            reportes.buscarPorId(reporteId).orElseThrow(ReporteNoEncontradoExcepcion::new);
            Reporte actualizado = reportes.cambiarEstado(reporteId, estado);
            historial.registrar(administrador.getId(), AccionHistorial.MODERACION,
                    "Reporte " + reporteId + " marcado como " + estado, LocalDateTime.now(reloj));
            return actualizado;
        });
    }
}
