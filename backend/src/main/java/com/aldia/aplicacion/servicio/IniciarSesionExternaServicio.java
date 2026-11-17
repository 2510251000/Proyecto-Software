package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Base64;

import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.NivelInicialNoConfiguradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.IdentidadExterna;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.IniciarSesionExternaCasoDeUso;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.puerto.salida.VerificadorIdentidadPuerto;

/**
 * Inicio de sesión con Google. Google (vía Firebase) ya comprobó quién es la persona; aquí se
 * busca su cuenta por el correo o se crea. Una cuenta que ya existía con contraseña sigue
 * igual: puede entrar de las dos formas.
 */
public class IniciarSesionExternaServicio implements IniciarSesionExternaCasoDeUso {

    private static final SecureRandom AZAR = new SecureRandom();
    private static final int BYTES_AL_AZAR = 32;

    private final VerificadorIdentidadPuerto verificador;
    private final UsuarioRepositorioPuerto usuarios;
    private final NivelRepositorioPuerto niveles;
    private final CifradorPuerto cifrador;
    private final TokenPuerto token;
    private final HistorialRepositorioPuerto historial;
    private final EjecutorTransaccionalPuerto transaccion;
    private final Clock reloj;

    @SuppressWarnings("java:S107") // Caso de uso que orquesta varias reglas: recibe un puerto por cada una.
    public IniciarSesionExternaServicio(VerificadorIdentidadPuerto verificador, UsuarioRepositorioPuerto usuarios,
                                        NivelRepositorioPuerto niveles, CifradorPuerto cifrador, TokenPuerto token,
                                        HistorialRepositorioPuerto historial, EjecutorTransaccionalPuerto transaccion,
                                        Clock reloj) {
        this.verificador = verificador;
        this.usuarios = usuarios;
        this.niveles = niveles;
        this.cifrador = cifrador;
        this.token = token;
        this.historial = historial;
        this.transaccion = transaccion;
        this.reloj = reloj;
    }

    @Override
    public String iniciarSesion(String tokenExterno) {
        IdentidadExterna identidad = verificador.verificar(tokenExterno);
        String correo = identidad.correo().trim().toLowerCase();
        return transaccion.ejecutar(() -> {
            LocalDateTime ahora = LocalDateTime.now(reloj);
            Usuario usuario = usuarios.buscarPorCorreo(correo).orElseGet(() -> crear(correo, identidad.nombre(), ahora));
            if (!usuario.isActivo()) {
                throw new CuentaDesactivadaExcepcion();
            }
            historial.registrar(usuario.getId(), AccionHistorial.INICIO_SESION, "Inició sesión con Google", ahora);
            return token.generarToken(usuario);
        });
    }

    /**
     * 32 bytes al azar en Base64 (43 caracteres): bastante fuerte y por debajo del límite de 72 bytes
     * que acepta BCrypt.
     */
    static String textoAlAzar() {
        byte[] bytes = new byte[BYTES_AL_AZAR];
        AZAR.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Usuario crear(String correo, String nombre, LocalDateTime ahora) {
        Nivel nivelInicial = niveles.buscarNivelInicial().orElseThrow(NivelInicialNoConfiguradoExcepcion::new);
        // No tiene contraseña propia: se guarda una al azar que nadie conoce (la columna es obligatoria).
        String contrasenaAlAzar = cifrador.cifrar(textoAlAzar());
        String nombreLimpio = nombre == null || nombre.isBlank() ? null : nombre.trim();
        Usuario guardado = usuarios.guardar(new Usuario(null, correo, contrasenaAlAzar, Usuario.Rol.USUARIO_COMUN,
                nivelInicial, ahora, true, nombreLimpio, null, 0));
        historial.registrar(guardado.getId(), AccionHistorial.REGISTRO, "Creó su cuenta con Google", ahora);
        return guardado;
    }
}
