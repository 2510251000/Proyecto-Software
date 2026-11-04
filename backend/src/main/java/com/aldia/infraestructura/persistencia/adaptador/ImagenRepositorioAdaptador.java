package com.aldia.infraestructura.persistencia.adaptador;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.ImagenNoticia;
import com.aldia.dominio.puerto.salida.ImagenRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.MultimediaEntidad;
import com.aldia.infraestructura.persistencia.repositorio.MultimediaRepositorioJPA;

@Component
@Transactional
public class ImagenRepositorioAdaptador implements ImagenRepositorioPuerto {

    private final MultimediaRepositorioJPA repositorio;

    public ImagenRepositorioAdaptador(MultimediaRepositorioJPA repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public void guardarTodas(Long noticiaId, List<ImagenNoticia> imagenes) {
        repositorio.saveAll(imagenes.stream()
                .map(i -> new MultimediaEntidad(noticiaId, (short) i.orden(), i.clave(), i.textoAlternativo()))
                .toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImagenNoticia> buscarDeNoticia(Long noticiaId) {
        return repositorio.findByNoticiaIdAndTipoOrderByOrdenAsc(noticiaId, MultimediaEntidad.TIPO_IMAGEN)
                .stream().map(ImagenRepositorioAdaptador::aDominio).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<ImagenNoticia>> buscarDeNoticias(List<Long> noticiaIds) {
        if (noticiaIds.isEmpty()) {
            return Map.of();
        }
        return repositorio.findByNoticiaIdInAndTipoOrderByOrdenAsc(noticiaIds, MultimediaEntidad.TIPO_IMAGEN)
                .stream()
                .collect(Collectors.groupingBy(MultimediaEntidad::getNoticiaId, LinkedHashMap::new,
                        Collectors.mapping(ImagenRepositorioAdaptador::aDominio, Collectors.toList())));
    }

    private static ImagenNoticia aDominio(MultimediaEntidad entidad) {
        return new ImagenNoticia(entidad.getOrden(), entidad.getUrl(), entidad.getTextoAlternativo());
    }
}
