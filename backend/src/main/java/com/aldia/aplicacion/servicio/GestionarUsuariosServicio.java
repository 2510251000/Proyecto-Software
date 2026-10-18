package com.aldia.aplicacion.servicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.modelo.AccionHistorial;
import com.aldia.dominio.modelo.CambiosUsuario;
import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Notificacion;
import com.aldia.dominio.modelo.TipoNotificacion;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.entrada.GestionarUsuariosCasoDeUso;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.CalculadoraNivel;

/**
 * Gestión de cuentas por el administrador: activar o desactivar, cambiar el rol y
 * fijar el nivel. Fijar un nivel deja el puntaje en el mínimo de ese nivel, para que la
 * regla de niveles siga cuadrando. Un administrador no puede quitarse a sí mismo el acceso.
 */
public class GestionarUsuariosServicio implements GestionarUsuariosCasoDeUso {

    private final UsuarioRepositorioPuerto usuarioRepositorioPuerto;
    private final NivelRepositorioPuerto nivelRepositorioPuerto;
    private final NotificacionRepositorioPuerto notificacionRepositorioPuerto;
    private final HistorialRepositorioPuerto historialRepositorioPuerto;
    private final EjecutorTransaccionalPuerto transaccion;
    private final CalculadoraNivel calculadoraNivel;
    private final Clock reloj;

    public GestionarUsuariosServicio(UsuarioRepositorioPuerto usuarioRepositorioPuerto,
                                     NivelRepositorioPuerto nivelRepositorioPuerto,
                                     NotificacionRepositorioPuerto notificacionRepositorioPuerto,
                                     HistorialRepositorioPuerto historialRepositorioPuerto,
                                     EjecutorTransaccionalPuerto transaccion,
                                     CalculadoraNivel calculadoraNivel,
                                     Clock reloj) {
        this.usuarioRepositorioPuerto = usuarioRepositorioPuerto;
        this.nivelRepositorioPuerto = nivelRepositorioPuerto;
        this.notificacionRepositorioPuerto = notificacionRepositorioPuerto;
        this.historialRepositorioPuerto = historialRepositorioPuerto;
        this.transaccion = transaccion;
        this.calculadoraNivel = calculadoraNivel;
        this.reloj = reloj;
    }

    @Override
    public List<Usuario> listar() {
        return usuarioRepositorioPuerto.listarTodos();
    }

    @Override
    public Usuario actualizar(String correoAdministrador, Long usuarioId, CambiosUsuario cambios) {
        return transaccion.ejecutar(() -> aplicar(correoAdministrador, usuarioId, cambios));
    }

    private Usuario aplicar(String correoAdministrador, Long usuarioId, CambiosUsuario cambios) {
        Usuario administrador = usuarioRepositorioPuerto.buscarPorCorreo(correoAdministrador)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);
        if (!administrador.esAdministrador()) {
            throw new AccionNoPermitidaExcepcion("Solo un administrador puede gestionar usuarios");
        }

        Usuario usuario = usuarioRepositorioPuerto.buscarPorId(usuarioId)
                .orElseThrow(UsuarioNoEncontradoExcepcion::new);
        boolean esElMismo = usuario.getId().equals(administrador.getId());
        if (esElMismo && (Boolean.FALSE.equals(cambios.activo()) || cambios.rol() == Usuario.Rol.USUARIO_COMUN)) {
            throw new AccionNoPermitidaExcepcion("No puedes desactivarte ni quitarte el rol de administrador");
        }

        Usuario resultado = usuario;
        if (cambios.activo() != null) {
            resultado = resultado.conActivo(cambios.activo());
        }
        if (cambios.rol() != null) {
            resultado = resultado.conRol(cambios.rol());
        }

        LocalDateTime ahora = LocalDateTime.now(reloj);
        if (cambios.nivel() != null && cambios.nivel() != usuario.getNivel().getNumero()) {
            List<Nivel> niveles = nivelRepositorioPuerto.listarTodos();
            Nivel nivel = niveles.stream()
                    .filter(n -> n.getNumero() == cambios.nivel())
                    .findFirst()
                    .orElseThrow(() -> new DatosInvalidosExcepcion("El nivel " + cambios.nivel() + " no existe"));
            resultado = calculadoraNivel.conPuntaje(resultado, nivel.getPuntajeMinimo(), niveles);
            historialRepositorioPuerto.registrar(usuario.getId(), AccionHistorial.CAMBIO_NIVEL,
                    "El administrador lo pasó al nivel " + nivel.getNumero(), ahora);
            notificacionRepositorioPuerto.guardarTodas(List.of(Notificacion.nueva(usuario.getId(),
                    TipoNotificacion.ASCENSO_NIVEL,
                    "Un administrador cambió tu nivel a " + nivel.getNumero() + " (" + nivel.getNombre() + ").",
                    null, ahora)));
        }

        return usuarioRepositorioPuerto.guardar(resultado);
    }
}
