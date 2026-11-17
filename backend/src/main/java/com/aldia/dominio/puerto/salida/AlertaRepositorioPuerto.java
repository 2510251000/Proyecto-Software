package com.aldia.dominio.puerto.salida;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Alerta;
import com.aldia.dominio.modelo.TipoAlerta;

/** Solo trae alertas de noticias publicadas: si un administrador oculta la noticia, la alerta deja de sonar. */
public interface AlertaRepositorioPuerto {

    void guardar(Long noticiaId, TipoAlerta tipo);

    Optional<Alerta> buscar(Long noticiaId);

    /** Las alertas activas publicadas desde {@code desde}; de una ciudad o de todas si es null. Más recientes primero. */
    List<Alerta> activasDesde(Long ciudadId, LocalDateTime desde);

    List<Alerta> buscarTodas(Collection<Long> noticiaIds);

    void resolver(Long noticiaId, LocalDateTime fecha);
}
