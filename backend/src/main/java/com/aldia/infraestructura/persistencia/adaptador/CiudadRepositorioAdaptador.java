package com.aldia.infraestructura.persistencia.adaptador;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.infraestructura.persistencia.mapeador.CiudadNivelMapeador;
import com.aldia.infraestructura.persistencia.repositorio.CiudadRepositorioJPA;

@Component
@Transactional
public class CiudadRepositorioAdaptador implements CiudadRepositorioPuerto {

    private final CiudadRepositorioJPA ciudadRepositorioJPA;

    public CiudadRepositorioAdaptador(CiudadRepositorioJPA ciudadRepositorioJPA) {
        this.ciudadRepositorioJPA = ciudadRepositorioJPA;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existePorId(Long id) {
        return id != null && ciudadRepositorioJPA.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ciudad> buscarPorId(Long id) {
        return id == null ? Optional.empty() : ciudadRepositorioJPA.findById(id).map(CiudadNivelMapeador::aCiudad);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ciudad> listarTodas() {
        return ciudadRepositorioJPA.findAllByOrderByNombreAsc().stream().map(CiudadNivelMapeador::aCiudad).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ciudad> buscarPorIdLugar(String idLugar) {
        return ciudadRepositorioJPA.findByIdLugar(idLugar).map(CiudadNivelMapeador::aCiudad);
    }

    /** El catálogo es corto, así que se compara en memoria sin tildes ni mayúsculas. */
    @Override
    @Transactional(readOnly = true)
    public Optional<Ciudad> buscarPorNombreYDepartamento(String nombre, String departamento) {
        String nombreBuscado = clave(nombre);
        String departamentoBuscado = clave(departamento);
        return ciudadRepositorioJPA.findAll().stream()
                .filter(c -> clave(c.getNombre()).equals(nombreBuscado)
                        && clave(c.getDepartamento()).equals(departamentoBuscado))
                .findFirst()
                .map(CiudadNivelMapeador::aCiudad);
    }

    @Override
    public Ciudad guardar(Ciudad ciudad) {
        return CiudadNivelMapeador.aCiudad(ciudadRepositorioJPA.save(CiudadNivelMapeador.aEntidad(ciudad)));
    }

    private static String clave(String texto) {
        if (texto == null) {
            return "";
        }
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}
