package com.aldia.dominio.servicio;

import com.aldia.dominio.excepcion.LimiteDiarioAlcanzadoExcepcion;
import com.aldia.dominio.modelo.CupoDiario;
import com.aldia.dominio.modelo.Usuario;

/**
 * Límite diario de publicaciones: cada nivel tiene el suyo (tabla nivel; el 1 publica
 * máximo 3). Los administradores publican noticias oficiales sin límite si así está configurado.
 */
public class ReglaLimiteDiario {

    private final boolean administradorSinLimite;

    public ReglaLimiteDiario(boolean administradorSinLimite) {
        this.administradorSinLimite = administradorSinLimite;
    }

    public CupoDiario cupo(Usuario usuario, long publicadasHoy) {
        boolean ilimitado = administradorSinLimite && usuario.esAdministrador();
        return new CupoDiario(usuario.getNivel().getLimiteNoticiasDiarias(), publicadasHoy, ilimitado);
    }

    /** Lanza LimiteDiarioAlcanzadoExcepcion si el usuario ya no puede publicar hoy. */
    public void verificar(Usuario usuario, long publicadasHoy) {
        if (!cupo(usuario, publicadasHoy).puedePublicar()) {
            throw new LimiteDiarioAlcanzadoExcepcion(usuario.getNivel().getLimiteNoticiasDiarias(),
                    usuario.getNivel().getNombre());
        }
    }
}
