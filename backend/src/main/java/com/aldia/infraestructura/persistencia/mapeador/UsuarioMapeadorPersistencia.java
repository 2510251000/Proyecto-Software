package com.aldia.infraestructura.persistencia.mapeador;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.infraestructura.persistencia.entidad.CiudadEntidad;
import com.aldia.infraestructura.persistencia.entidad.NivelEntidad;
import com.aldia.infraestructura.persistencia.entidad.UsuarioEntidad;

@Component
public class UsuarioMapeadorPersistencia {

    public UsuarioEntidad aEntidad(Usuario usuario) {
        UsuarioEntidad entidad = new UsuarioEntidad();
        entidad.setId(usuario.getId());
        entidad.setCorreo(usuario.getCorreo());
        entidad.setContrasenaCifrada(usuario.getContrasenaCifrada());
        entidad.setRol(UsuarioEntidad.Rol.valueOf(usuario.getRol().name()));

        // Nivel y ciudad se referencian por id: no se modifican desde aquí.
        NivelEntidad nivelEntidad = new NivelEntidad();
        nivelEntidad.setId(usuario.getNivel().getId());
        entidad.setNivel(nivelEntidad);

        if (usuario.getCiudad() != null && usuario.getCiudad().id() != null) {
            CiudadEntidad ciudadEntidad = new CiudadEntidad();
            ciudadEntidad.setId(usuario.getCiudad().id());
            entidad.setCiudad(ciudadEntidad);
        }

        entidad.setFechaRegistro(usuario.getFechaRegistro());
        entidad.setActivo(usuario.isActivo());
        entidad.setNombre(usuario.getNombre());
        entidad.setPuntaje(usuario.getPuntaje());
        return entidad;
    }

    public Usuario aDominio(UsuarioEntidad entidad) {
        return new Usuario(
                entidad.getId(),
                entidad.getCorreo(),
                entidad.getContrasenaCifrada(),
                Usuario.Rol.valueOf(entidad.getRol().name()),
                CiudadNivelMapeador.aNivel(entidad.getNivel()),
                entidad.getFechaRegistro(),
                entidad.isActivo(),
                entidad.getNombre(),
                CiudadNivelMapeador.aCiudad(entidad.getCiudad()),
                entidad.getPuntaje()
        );
    }
}
