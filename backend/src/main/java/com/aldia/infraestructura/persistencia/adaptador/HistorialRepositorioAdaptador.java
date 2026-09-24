package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.HistorialEntidad;
import com.aldia.infraestructura.persistencia.repositorio.HistorialRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

@Component
public class HistorialRepositorioAdaptador implements HistorialRepositorioPuerto {

    private final HistorialRepositorioJPA historialRepositorioJPA;
    private final UsuarioRepositorioJPA usuarioRepositorioJPA;

    public HistorialRepositorioAdaptador(HistorialRepositorioJPA historialRepositorioJPA,
                                         UsuarioRepositorioJPA usuarioRepositorioJPA) {
        this.historialRepositorioJPA = historialRepositorioJPA;
        this.usuarioRepositorioJPA = usuarioRepositorioJPA;
    }

    @Override
    public void registrar(Long usuarioId, AccionHistorial accion, String detalle, LocalDateTime fecha) {
        HistorialEntidad entidad = new HistorialEntidad();
        entidad.setUsuario(usuarioRepositorioJPA.getReferenceById(usuarioId));
        entidad.setAccion(accion);
        entidad.setDetalle(detalle);
        entidad.setFecha(fecha);
        historialRepositorioJPA.save(entidad);
    }
}
