package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;

import com.aldia.dominio.modelo.AccionHistorial;

public interface HistorialRepositorioPuerto {

    void registrar(Long usuarioId, AccionHistorial accion, String detalle, LocalDateTime fecha);
}
