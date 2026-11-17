package com.aldia.infraestructura.datosiniciales;

import java.time.Clock;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.aldia.dominio.excepcion.NivelInicialNoConfiguradoExcepcion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

/**
 * En producción no hay datos de demostración con una contraseña conocida para el administrador:
 * al arrancar, la cuenta de ADMIN_CORREO queda como administrador, activa y con la contraseña de
 * ADMIN_CONTRASENA (que vive solo en los secretos del servidor). Si alguna de las dos variables
 * está vacía, no hace nada.
 */
@Component
@Order(0)
public class CuentaAdministradorInicial implements ApplicationRunner {

    private static final Logger LOG = LoggerFactory.getLogger(CuentaAdministradorInicial.class);
    private static final int LARGO_MINIMO_CONTRASENA = 10;

    private final UsuarioRepositorioPuerto usuarios;
    private final NivelRepositorioPuerto niveles;
    private final CifradorPuerto cifrador;
    private final Clock reloj;
    private final String correo;
    private final String contrasena;

    public CuentaAdministradorInicial(UsuarioRepositorioPuerto usuarios, NivelRepositorioPuerto niveles,
                                      CifradorPuerto cifrador, Clock reloj,
                                      @Value("${aldia.administrador.correo:}") String correo,
                                      @Value("${aldia.administrador.contrasena:}") String contrasena) {
        this.usuarios = usuarios;
        this.niveles = niveles;
        this.cifrador = cifrador;
        this.reloj = reloj;
        this.correo = correo.trim().toLowerCase();
        this.contrasena = contrasena;
    }

    @Override
    public void run(ApplicationArguments argumentos) {
        if (correo.isBlank() || contrasena.isBlank()) {
            return;
        }
        if (contrasena.length() < LARGO_MINIMO_CONTRASENA) {
            throw new IllegalStateException("ADMIN_CONTRASENA debe tener al menos " + LARGO_MINIMO_CONTRASENA
                    + " caracteres");
        }
        String cifrada = cifrador.cifrar(contrasena);
        Usuario admin = usuarios.buscarPorCorreo(correo)
                .map(existente -> new Usuario(existente.getId(), existente.getCorreo(), cifrada,
                        Usuario.Rol.ADMINISTRADOR, existente.getNivel(), existente.getFechaRegistro(), true,
                        existente.getNombre(), existente.getCiudad(), existente.getPuntaje()))
                .orElseGet(() -> new Usuario(null, correo, cifrada, Usuario.Rol.ADMINISTRADOR,
                        niveles.buscarNivelInicial().orElseThrow(NivelInicialNoConfiguradoExcepcion::new),
                        LocalDateTime.now(reloj), true, "Administrador del portal", null, 0));
        usuarios.guardar(admin);
        LOG.info("Cuenta de administrador lista: {}", correo);
    }
}
