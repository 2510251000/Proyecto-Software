package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Reporte;

public interface ReporteRepositorioPuerto {

    boolean existe(Long usuarioId, Long noticiaId);

    Reporte guardar(Long noticiaId, Long usuarioId, MotivoReporte motivo, String descripcion, LocalDateTime fecha);

    /** Los reportes del estado indicado (o todos si es null), del más reciente al más antiguo. */
    List<Reporte> listar(EstadoReporte estado, int limite);

    Optional<Reporte> buscarPorId(Long id);

    Reporte cambiarEstado(Long id, EstadoReporte estado);
}
