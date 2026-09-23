package com.aldia.aplicacion.servicio;

import org.springframework.stereotype.Service;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.IniciarSesionCasoDeUso;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@Service
public class IniciarSesionServicio implements IniciarSesionCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final CifradorPuerto cifradorPuerto;
    private final TokenPuerto tokenPuerto;

    public IniciarSesionServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                  CifradorPuerto cifradorPuerto,
                                  TokenPuerto tokenPuerto) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.cifradorPuerto = cifradorPuerto;
        this.tokenPuerto = tokenPuerto;
    }

    @Override
    public String iniciarSesion(String correo, String contrasena) {
        Usuario usuario = usuarioRepositorioPuerto.buscarPorCorreo(correo)
                .orElseThrow(CredencialesInvalidasExcepcion::new);

        if (!cifradorPuerto.coincide(contrasena, usuario.getContrasenaCifrada())) {
            throw new CredencialesInvalidasExcepcion();
        }

        return tokenPuerto.generarToken(usuario);
    }
}