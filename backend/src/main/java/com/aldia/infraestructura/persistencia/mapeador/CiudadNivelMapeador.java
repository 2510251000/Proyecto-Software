package com.aldia.infraestructura.persistencia.mapeador;

import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.infraestructura.persistencia.entidad.CiudadEntidad;
import com.aldia.infraestructura.persistencia.entidad.NivelEntidad;

/**
 * Conversión de los dos catálogos (ciudad y nivel) entre la base y el dominio.
 */
public final class CiudadNivelMapeador {

    private CiudadNivelMapeador() {
    }

    public static Ciudad aCiudad(CiudadEntidad entidad) {
        if (entidad == null) {
            return null;
        }
        return new Ciudad(entidad.getId(), entidad.getNombre(), entidad.getDepartamento(),
                entidad.getLatitud(), entidad.getLongitud(), entidad.getIdLugar());
    }

    public static CiudadEntidad aEntidad(Ciudad ciudad) {
        CiudadEntidad entidad = new CiudadEntidad();
        entidad.setId(ciudad.id());
        entidad.setNombre(ciudad.nombre());
        entidad.setDepartamento(ciudad.departamento());
        entidad.setLatitud(ciudad.latitud());
        entidad.setLongitud(ciudad.longitud());
        entidad.setIdLugar(ciudad.idLugar());
        return entidad;
    }

    public static Nivel aNivel(NivelEntidad entidad) {
        return new Nivel(entidad.getId(), entidad.getNumero(), entidad.getNombre(),
                entidad.getPuntajeMinimo(), entidad.getLimiteNoticiasDiarias());
    }
}
