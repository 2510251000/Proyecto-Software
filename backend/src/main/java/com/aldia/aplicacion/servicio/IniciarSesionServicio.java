package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.IniciarSesionCasoDeUso;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

public class IniciarSesionServicio implements IniciarSesionCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final CifradorPuerto cifradorPuerto;
    private final TokenPuerto tokenPuerto;
    private final HistorialRepositorioPuerto historialRepositorioPuerto;
    private final Clock reloj;

    public IniciarSesionServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                  CifradorPuerto cifradorPuerto,
                                  TokenPuerto tokenPuerto,
                                  HistorialRepositorioPuerto historialRepositorioPuerto,
                                  Clock reloj) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.cifradorPuerto = cifradorPuerto;
        this.tokenPuerto = tokenPuerto;
        this.historialRepositorioPuerto = historialRepositorioPuerto;
        this.reloj = reloj;
    }

    @Override
    public String iniciarSesion(String correo, String contrasena) {
        Usuario usuario = usuarioRepositorioPuerto.buscarPorCorreo(correo)
                .orElseThrow(CredencialesInvalidasExcepcion::new);

        if (!cifradorPuerto.coincide(contrasena, usuario.getContrasenaCifrada())) {
            throw new CredencialesInvalidasExcepcion();
        }

        // Se revisa después de la contraseña: así solo se revela que la cuenta
        // está desactivada a quien ya demostró ser su dueño.
        if (!usuario.isActivo()) {
            throw new CuentaDesactivadaExcepcion();
        }

        String token = tokenPuerto.generarToken(usuario);
        // Solo los inicios de sesión correctos quedan en el historial; nunca la contraseña ni el token.
        historialRepositorioPuerto.registrar(usuario.getId(), AccionHistorial.INICIO_SESION, "Inició sesión",
                LocalDateTime.now(reloj));
        return token;
    }
}
