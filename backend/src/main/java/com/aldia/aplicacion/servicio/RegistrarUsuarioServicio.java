package com.aldia.aplicacion.servicio;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.RegistrarUsuarioCasoDeUso;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@Service
public class RegistrarUsuarioServicio implements RegistrarUsuarioCasoDeUso {

    private static final Long ID_NIVEL_BASICO = 1L;

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final CifradorPuerto cifradorPuerto;

    public RegistrarUsuarioServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                     CifradorPuerto cifradorPuerto) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.cifradorPuerto = cifradorPuerto;
    }

    @Override
    public Usuario registrar(String correo, String contrasena) {
        if (usuarioRepositorioPuerto.existePorCorreo(correo)) {
            throw new UsuarioYaExisteExcepcion(correo);
        }

        String contrasenaCifrada = cifradorPuerto.cifrar(contrasena);
        Nivel nivelBasico = new Nivel(ID_NIVEL_BASICO, null, 0);

        Usuario nuevoUsuario = new Usuario(
                null,
                correo,
                contrasenaCifrada,
                Usuario.Rol.USUARIO_COMUN,
                nivelBasico,
                LocalDateTime.now()
        );

        return usuarioRepositorioPuerto.guardar(nuevoUsuario);
    }
}