package com.aldia.infraestructura.persistencia.repositorio;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aldia.infraestructura.persistencia.entidad.MultimediaEntidad;

public interface MultimediaRepositorioJPA extends JpaRepository<MultimediaEntidad, Long> {

    List<MultimediaEntidad> findByNoticiaIdAndTipoOrderByOrdenAsc(Long noticiaId, String tipo);

    List<MultimediaEntidad> findByNoticiaIdInAndTipoOrderByOrdenAsc(Collection<Long> noticiaIds, String tipo);
}
