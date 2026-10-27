package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.FiltroNoticias;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;
import com.aldia.infraestructura.persistencia.mapeador.NoticiaMapeador;
import com.aldia.infraestructura.persistencia.repositorio.CiudadRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.NoticiaRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

@Component
@Transactional
public class NoticiaRepositorioAdaptador implements NoticiaRepositorioPuerto {

    // Para buscar sin importar tildes: translate(lower(texto), 'áéíóúüñ', 'aeiouun').
    private static final String CON_TILDES = "áéíóúüñ";
    private static final String SIN_TILDES = "aeiouun";
    private static final Sort MAS_RECIENTES = Sort.by(Sort.Order.desc("fechaPublicacion"), Sort.Order.desc("id"));

    private final NoticiaRepositorioJPA noticiaRepositorioJPA;
    private final UsuarioRepositorioJPA usuarioRepositorioJPA;
    private final CiudadRepositorioJPA ciudadRepositorioJPA;
    private final NoticiaMapeador mapeador;

    public NoticiaRepositorioAdaptador(NoticiaRepositorioJPA noticiaRepositorioJPA,
                                       UsuarioRepositorioJPA usuarioRepositorioJPA,
                                       CiudadRepositorioJPA ciudadRepositorioJPA,
                                       NoticiaMapeador mapeador) {
        this.noticiaRepositorioJPA = noticiaRepositorioJPA;
        this.usuarioRepositorioJPA = usuarioRepositorioJPA;
        this.ciudadRepositorioJPA = ciudadRepositorioJPA;
        this.mapeador = mapeador;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Noticia> buscarPublicadas(FiltroNoticias filtro, int limite) {
        Specification<NoticiaEntidad> condiciones = (raiz, consulta, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            predicados.add(cb.equal(raiz.get("estado"), NoticiaEntidad.Estado.PUBLICADA));

            if (filtro.tipo() == FiltroNoticias.Tipo.OFICIALES) {
                predicados.add(cb.isTrue(raiz.get("oficial")));
            } else if (filtro.tipo() == FiltroNoticias.Tipo.COMUNITARIAS) {
                predicados.add(cb.isFalse(raiz.get("oficial")));
            }

            if (filtro.ciudadId() != null) {
                predicados.add(cb.equal(raiz.get("ciudad").get("id"), filtro.ciudadId()));
            }

            if (filtro.texto() != null) {
                String patron = "%" + normalizar(filtro.texto()) + "%";
                predicados.add(cb.or(
                        cb.like(sinTildes(cb, raiz.get("titulo")), patron),
                        cb.like(sinTildes(cb, raiz.get("resumen")), patron),
                        cb.like(sinTildes(cb, raiz.get("contenido")), patron)));
            }
            return cb.and(predicados.toArray(Predicate[]::new));
        };

        return noticiaRepositorioJPA.findAll(condiciones, PageRequest.of(0, limite, MAS_RECIENTES))
                .stream()
                .map(mapeador::aDominio)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Noticia> buscarPublicadaPorId(Long id) {
        return noticiaRepositorioJPA.findByIdAndEstado(id, NoticiaEntidad.Estado.PUBLICADA)
                .map(mapeador::aDominio);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Noticia> buscarPorId(Long id) {
        return noticiaRepositorioJPA.findById(id).map(mapeador::aDominio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Noticia> buscarParaModeracion(Noticia.Estado estado, Boolean oficial, int limite) {
        Specification<NoticiaEntidad> condiciones = (raiz, consulta, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            if (estado != null) {
                predicados.add(cb.equal(raiz.get("estado"), NoticiaEntidad.Estado.valueOf(estado.name())));
            } else {
                predicados.add(cb.notEqual(raiz.get("estado"), NoticiaEntidad.Estado.ELIMINADA));
            }
            if (oficial != null) {
                predicados.add(cb.equal(raiz.get("oficial"), oficial));
            }
            return cb.and(predicados.toArray(Predicate[]::new));
        };
        return noticiaRepositorioJPA.findAll(condiciones, PageRequest.of(0, limite, MAS_RECIENTES))
                .stream()
                .map(mapeador::aDominio)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarDelAutorDesde(Long autorId, LocalDateTime desde) {
        return noticiaRepositorioJPA.countByUsuario_IdAndFechaPublicacionGreaterThanEqual(autorId, desde);
    }

    @Override
    public Noticia guardarNueva(NuevaNoticia datos, Long autorId, boolean oficial, LocalDateTime fechaPublicacion) {
        NoticiaEntidad entidad = new NoticiaEntidad();
        entidad.setTitulo(datos.titulo());
        entidad.setResumen(datos.resumen());
        entidad.setContenido(datos.contenido());
        entidad.setLatitud(datos.latitud());
        entidad.setLongitud(datos.longitud());
        entidad.setIdLugarGoogle(datos.idLugarGoogle());
        entidad.setFechaPublicacion(fechaPublicacion);
        entidad.setOficial(oficial);
        entidad.setEstado(NoticiaEntidad.Estado.PUBLICADA);

        // Referencias por id: no hace falta cargar el usuario ni la ciudad completos para guardar.
        entidad.setUsuario(usuarioRepositorioJPA.getReferenceById(autorId));
        entidad.setCiudad(ciudadRepositorioJPA.getReferenceById(datos.ciudadId()));

        return mapeador.aDominio(noticiaRepositorioJPA.save(entidad));
    }

    @Override
    public void cambiarEstado(Long id, Noticia.Estado estado) {
        NoticiaEntidad entidad = noticiaRepositorioJPA.findById(id).orElseThrow(NoticiaNoEncontradaExcepcion::new);
        entidad.setEstado(NoticiaEntidad.Estado.valueOf(estado.name()));
        noticiaRepositorioJPA.save(entidad);
    }

    private static Expression<String> sinTildes(jakarta.persistence.criteria.CriteriaBuilder cb,
                                                Expression<String> campo) {
        return cb.function("translate", String.class, cb.lower(campo), cb.literal(CON_TILDES), cb.literal(SIN_TILDES));
    }

    private static String normalizar(String texto) {
        String minusculas = texto.toLowerCase();
        StringBuilder resultado = new StringBuilder(minusculas.length());
        for (char letra : minusculas.toCharArray()) {
            int posicion = CON_TILDES.indexOf(letra);
            char limpia = posicion >= 0 ? SIN_TILDES.charAt(posicion) : letra;
            // Los comodines de LIKE se buscan como texto literal.
            if (limpia == '%' || limpia == '_') {
                continue;
            }
            resultado.append(limpia);
        }
        return resultado.toString();
    }
}
