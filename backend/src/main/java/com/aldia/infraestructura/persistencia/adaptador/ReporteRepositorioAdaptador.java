package com.aldia.infraestructura.persistencia.adaptador;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.excepcion.ReporteNoEncontradoExcepcion;
import com.aldia.dominio.modelo.EstadoReporte;
import com.aldia.dominio.modelo.MotivoReporte;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Reporte;
import com.aldia.dominio.puerto.salida.ReporteRepositorioPuerto;
import com.aldia.infraestructura.persistencia.entidad.NoticiaEntidad;
import com.aldia.infraestructura.persistencia.entidad.ReporteEntidad;
import com.aldia.infraestructura.persistencia.mapeador.NoticiaMapeador;
import com.aldia.infraestructura.persistencia.repositorio.NoticiaRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.ReporteRepositorioJPA;
import com.aldia.infraestructura.persistencia.repositorio.UsuarioRepositorioJPA;

@Component
@Transactional
public class ReporteRepositorioAdaptador implements ReporteRepositorioPuerto {

    private final ReporteRepositorioJPA repositorio;
    private final UsuarioRepositorioJPA usuarios;
    private final NoticiaRepositorioJPA noticias;

    public ReporteRepositorioAdaptador(ReporteRepositorioJPA repositorio, UsuarioRepositorioJPA usuarios,
                                       NoticiaRepositorioJPA noticias) {
        this.repositorio = repositorio;
        this.usuarios = usuarios;
        this.noticias = noticias;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existe(Long usuarioId, Long noticiaId) {
        return repositorio.existsByUsuario_IdAndNoticia_Id(usuarioId, noticiaId);
    }

    @Override
    public Reporte guardar(Long noticiaId, Long usuarioId, MotivoReporte motivo, String descripcion,
                           LocalDateTime fecha) {
        ReporteEntidad entidad = new ReporteEntidad(motivo, descripcion, fecha, usuarios.findById(usuarioId).orElseThrow(),
                noticias.findById(noticiaId).orElseThrow());
        return aDominio(repositorio.save(entidad));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reporte> listar(EstadoReporte estado, int limite) {
        PageRequest pagina = PageRequest.of(0, limite);
        List<ReporteEntidad> filas = estado == null
                ? repositorio.findAllByOrderByFechaDescIdDesc(pagina)
                : repositorio.findByEstadoOrderByFechaDescIdDesc(estado, pagina);
        return filas.stream().map(ReporteRepositorioAdaptador::aDominio).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Reporte> buscarPorId(Long id) {
        return repositorio.findWithDetallesById(id).map(ReporteRepositorioAdaptador::aDominio);
    }

    @Override
    public Reporte cambiarEstado(Long id, EstadoReporte estado) {
        ReporteEntidad entidad = repositorio.findWithDetallesById(id).orElseThrow(ReporteNoEncontradoExcepcion::new);
        entidad.setEstado(estado);
        return aDominio(repositorio.save(entidad));
    }

    private static Reporte aDominio(ReporteEntidad entidad) {
        NoticiaEntidad noticia = entidad.getNoticia();
        return new Reporte(entidad.getId(), noticia.getId(), noticia.getTitulo(),
                Noticia.Estado.valueOf(noticia.getEstado().name()), entidad.getUsuario().getId(),
                NoticiaMapeador.nombreVisible(entidad.getUsuario()), entidad.getMotivo(), entidad.getDescripcion(),
                entidad.getEstado(), entidad.getFecha());
    }
}
