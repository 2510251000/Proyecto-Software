package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;

import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.NivelInicialNoConfiguradoExcepcion;
import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.NuevoUsuario;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.RegistrarUsuarioCasoDeUso;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

public class RegistrarUsuarioServicio implements RegistrarUsuarioCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final NivelRepositorioPuerto nivelRepositorioPuerto;
    private final CiudadRepositorioPuerto ciudadRepositorioPuerto;
    private final CifradorPuerto cifradorPuerto;
    private final Clock reloj;

    public RegistrarUsuarioServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                     NivelRepositorioPuerto nivelRepositorioPuerto,
                                     CiudadRepositorioPuerto ciudadRepositorioPuerto,
                                     CifradorPuerto cifradorPuerto,
                                     Clock reloj) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.nivelRepositorioPuerto = nivelRepositorioPuerto;
        this.ciudadRepositorioPuerto = ciudadRepositorioPuerto;
        this.cifradorPuerto = cifradorPuerto;
        this.reloj = reloj;
    }

    @Override
    public Usuario registrar(NuevoUsuario datos) {
        if (usuarioRepositorioPuerto.existePorCorreo(datos.correo())) {
            throw new UsuarioYaExisteExcepcion(datos.correo());
        }

        // La ciudad es la que el usuario obtuvo con la API de ubicación (ya está en el catálogo).
        Ciudad ciudad = ciudadRepositorioPuerto.buscarPorId(datos.ciudadId())
                .orElseThrow(CiudadNoEncontradaExcepcion::new);

        String contrasenaCifrada = cifradorPuerto.cifrar(datos.contrasena());
        Nivel nivelInicial = nivelRepositorioPuerto.buscarNivelInicial()
                .orElseThrow(NivelInicialNoConfiguradoExcepcion::new);

        String nombre = datos.nombre() == null || datos.nombre().isBlank() ? null : datos.nombre().trim();

        Usuario nuevoUsuario = new Usuario(
                null,
                datos.correo(),
                contrasenaCifrada,
                Usuario.Rol.USUARIO_COMUN,
                nivelInicial,
                LocalDateTime.now(reloj),
                true,
                nombre,
                ciudad,
                0
        );

        return usuarioRepositorioPuerto.guardar(nuevoUsuario);
    }
}
