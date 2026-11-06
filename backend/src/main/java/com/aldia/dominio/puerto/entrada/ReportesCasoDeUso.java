package com.aldia.dominio.puerto.entrada;

import java.util.List;

import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Reporte;

public interface ReportesCasoDeUso {

    /** Una vez por usuario y noticia: repetir lanza ReporteDuplicadoExcepcion. */
    Reporte reportar(String correo, Long noticiaId, MotivoReporte motivo, String descripcion);

    /** Panel del administrador: los del estado indicado, o todos. */
    List<Reporte> listar(EstadoReporte estado);

    Reporte cambiarEstado(String correoAdministrador, Long reporteId, EstadoReporte estado);
}
