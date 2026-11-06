package com.aldia.aplicacion.servicio;

import com.aldia.dominio.excepcion.ImagenNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.ArchivoImagen;
import com.aldia.dominio.modelo.ImagenNoticia;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.puerto.entrada.ImagenesNoticiaCasoDeUso;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;
import com.aldia.dominio.puerto.salida.ImagenRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

public class ImagenesNoticiaServicio implements ImagenesNoticiaCasoDeUso {

    private final NoticiaRepositorioPuerto noticias;
    private final ImagenRepositorioPuerto imagenes;
    private final UsuarioRepositorioPuerto usuarios;
    private final AlmacenImagenesPuerto almacen;

    public ImagenesNoticiaServicio(NoticiaRepositorioPuerto noticias, ImagenRepositorioPuerto imagenes,
                                   UsuarioRepositorioPuerto usuarios, AlmacenImagenesPuerto almacen) {
        this.noticias = noticias;
        this.imagenes = imagenes;
        this.usuarios = usuarios;
        this.almacen = almacen;
    }

    @Override
    public ArchivoImagen leer(Long noticiaId, int orden, String correoSolicitante, boolean esAdministrador) {
        Noticia noticia = noticias.buscarPorId(noticiaId).orElseThrow(NoticiaNoEncontradaExcepcion::new);
        boolean publica = noticia.getEstado() == Noticia.Estado.PUBLICADA;
        if (!publica && !esAdministrador && !esAutor(noticia, correoSolicitante)) {
            // Igual que una noticia inexistente: no se revela que existe.
            throw new NoticiaNoEncontradaExcepcion();
        }
        ImagenNoticia imagen = imagenes.buscarDeNoticia(noticiaId).stream()
                .filter(i -> i.orden() == orden)
                .findFirst()
                .orElseThrow(ImagenNoEncontradaExcepcion::new);
        byte[] contenido = almacen.leer(imagen.clave()).orElseThrow(ImagenNoEncontradaExcepcion::new);
        return new ArchivoImagen(contenido, imagen.formato(), publica);
    }

    private boolean esAutor(Noticia noticia, String correo) {
        if (correo == null || noticia.getAutorId() == null) {
            return false;
        }
        return usuarios.buscarPorCorreo(correo)
                .map(usuario -> noticia.getAutorId().equals(usuario.getId()))
                .orElse(false);
    }
}
