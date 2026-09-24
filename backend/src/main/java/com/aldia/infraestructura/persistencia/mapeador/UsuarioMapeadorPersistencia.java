package com.aldia.infraestructura.persistencia.mapeador;

import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;
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

        NivelEntidad nivelEntidad = new NivelEntidad();
        nivelEntidad.setId(usuario.getNivel().getId());
        entidad.setNivel(nivelEntidad);

        entidad.setFechaRegistro(usuario.getFechaRegistro());
        entidad.setActivo(usuario.isActivo());
        return entidad;
    }

    public Usuario aDominio(UsuarioEntidad entidad) {
        Nivel nivel = new Nivel(
                entidad.getNivel().getId(),
                entidad.getNivel().getNombre(),
                entidad.getNivel().getLimiteNoticiasDiarias()
        );

        return new Usuario(
                entidad.getId(),
                entidad.getCorreo(),
                entidad.getContrasenaCifrada(),
                Usuario.Rol.valueOf(entidad.getRol().name()),
                nivel,
                entidad.getFechaRegistro(),
                entidad.isActivo()
        );
    }
}