package com.aldia.aplicacion.servicio;

import org.springframework.stereotype.Service;

import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
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
        Usuario usuario = usuarioRepositorioPuerto.buscarPorCorreo(correo)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);

        // Un token emitido antes de desactivar la cuenta deja de servir.
        if (!usuario.isActivo()) {
            throw new CuentaDesactivadaExcepcion();
        }

        return usuario;
    }
}
