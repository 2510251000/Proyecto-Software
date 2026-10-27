package com.aldia.dominio.servicio;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.Usuario;

/**
 * Regla de niveles: el puntaje sube con cada noticia publicada y baja con cada noticia
 * moderada. El nivel es el más alto cuyo puntaje mínimo alcance el usuario.
 */
public class CalculadoraNivel {

    private final ParametrosNiveles parametros;

    public CalculadoraNivel(ParametrosNiveles parametros) {
        this.parametros = parametros;
    }

    /** Nivel que corresponde a un puntaje. Con un puntaje por debajo de todos, el primero. */
    public Nivel nivelPara(int puntaje, List<Nivel> niveles) {
        List<Nivel> ordenados = ordenar(niveles);
        if (ordenados.isEmpty()) {
            throw new IllegalArgumentException("No hay niveles configurados");
        }
        Nivel resultado = ordenados.get(0);
        for (Nivel nivel : ordenados) {
            if (puntaje >= nivel.getPuntajeMinimo()) {
                resultado = nivel;
            }
        }
        return resultado;
    }

    /** El nivel que sigue al actual, o vacío si ya está en el más alto. */
    public Optional<Nivel> siguiente(Nivel actual, List<Nivel> niveles) {
        return ordenar(niveles).stream()
                .filter(nivel -> nivel.getPuntajeMinimo() > actual.getPuntajeMinimo())
                .findFirst();
    }

    /** El usuario con los puntos de una publicación y el nivel que le corresponda. */
    public Usuario sumarPublicacion(Usuario usuario, List<Nivel> niveles) {
        return conPuntaje(usuario, usuario.getPuntaje() + parametros.puntosPorPublicacion(), niveles);
    }

    /** El usuario sin los puntos que pierde cuando le moderan una noticia. */
    public Usuario restarModeracion(Usuario usuario, List<Nivel> niveles) {
        return conPuntaje(usuario, usuario.getPuntaje() - parametros.puntosPenalizacionModeracion(), niveles);
    }

    /** Devuelve los puntos quitados por una moderación que se deshace. */
    public Usuario devolverModeracion(Usuario usuario, List<Nivel> niveles) {
        return conPuntaje(usuario, usuario.getPuntaje() + parametros.puntosPenalizacionModeracion(), niveles);
    }

    public Usuario conPuntaje(Usuario usuario, int puntaje, List<Nivel> niveles) {
        int ajustado = Math.max(0, puntaje);
        return usuario.conPuntajeYNivel(ajustado, nivelPara(ajustado, niveles));
    }

    public static boolean subio(Usuario antes, Usuario despues) {
        return despues.getNivel().getNumero() > antes.getNivel().getNumero();
    }

    private static List<Nivel> ordenar(List<Nivel> niveles) {
        return niveles.stream().sorted(Comparator.comparingInt(Nivel::getPuntajeMinimo)).toList();
    }
}
