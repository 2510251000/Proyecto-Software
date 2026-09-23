package com.aldia.aplicacion.servicio;

import org.springframework.stereotype.Service;

import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.ObtenerUsuarioActualCasoDeUso;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@Service
public class ObtenerUsuarioActualServicio implements ObtenerUsuarioActualCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;

    public ObtenerUsuarioActualServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
    }

    @Override
    public Usuario obtenerPorCorreo(String correo) {
        return usuarioRepositorioPuerto.buscarPorCorreo(correo)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);
    }
}
