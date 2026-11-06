package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.Fixtures;
import com.aldia.dominio.ImagenesDePrueba;
import com.aldia.dominio.excepcion.ImagenNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.modelo.ArchivoImagen;
import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.modelo.ImagenNoticia;
import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.ImagenRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;

@ExtendWith(MockitoExtension.class)
class ImagenesNoticiaServicioTest {

    private static final Long NOTICIA = 9L;
    private static final Long AUTOR = 3L;

    @Mock
    private NoticiaRepositorioPuerto noticias;

    @Mock
    private ImagenRepositorioPuerto imagenes;

    @Mock
    private UsuarioRepositorioPuerto usuarios;

    private ImagenesDePrueba.AlmacenEnMemoria almacen;
    private ImagenesNoticiaServicio servicio;

    @BeforeEach
    void preparar() {
        almacen = new ImagenesDePrueba.AlmacenEnMemoria();
        String clave = almacen.guardar(new byte[] {1, 2, 3}, "png");
        servicio = new ImagenesNoticiaServicio(noticias, imagenes, usuarios, almacen);
        lenient().when(imagenes.buscarDeNoticia(NOTICIA)).thenReturn(List.of(new ImagenNoticia(1, clave, "Foto")));
    }

    private void noticiaEn(Noticia.Estado estado) {
        when(noticias.buscarPorId(NOTICIA)).thenReturn(Optional.of(new Noticia(NOTICIA, "t", "r", "c",
                LocalDateTime.of(2026, 11, 4, 9, 0), false, estado, "Fusagasugá", 1L, AUTOR, "Autora", 1, null, null)));
    }

    @Test
    void unaNoticiaPublicadaSeVeSinSesionYSeMarcaComoPublica() {
        noticiaEn(Noticia.Estado.PUBLICADA);

        ArchivoImagen archivo = servicio.leer(NOTICIA, 1, null, false);

        assertThat(archivo.contenido()).containsExactly(1, 2, 3);
        assertThat(archivo.formato()).isEqualTo(FormatoImagen.PNG);
        assertThat(archivo.publica()).isTrue();
    }

    @Test
    void unaNoticiaOcultaNoExisteParaElPublico() {
        noticiaEn(Noticia.Estado.OCULTA);

        assertThatThrownBy(() -> servicio.leer(NOTICIA, 1, null, false))
                .isInstanceOf(NoticiaNoEncontradaExcepcion.class);
    }

    @Test
    void unaNoticiaOcultaTampocoParaOtroUsuario() {
        noticiaEn(Noticia.Estado.OCULTA);
        Usuario otro = Fixtures.usuario(99L, Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, 0);
        when(usuarios.buscarPorCorreo(otro.getCorreo())).thenReturn(Optional.of(otro));

        assertThatThrownBy(() -> servicio.leer(NOTICIA, 1, otro.getCorreo(), false))
                .isInstanceOf(NoticiaNoEncontradaExcepcion.class);
    }

    @Test
    void elAutorYElAdministradorSiVenLaFotoDeUnaNoticiaOculta() {
        noticiaEn(Noticia.Estado.OCULTA);
        Usuario autor = Fixtures.usuario(AUTOR, Usuario.Rol.USUARIO_COMUN, Fixtures.NIVEL_1, 0);
        when(usuarios.buscarPorCorreo(autor.getCorreo())).thenReturn(Optional.of(autor));

        assertThat(servicio.leer(NOTICIA, 1, autor.getCorreo(), false).publica()).isFalse();
        assertThat(servicio.leer(NOTICIA, 1, "admin@aldia.com", true).contenido()).hasSize(3);
    }

    @Test
    void unOrdenQueNoExisteRespondeQueNoHayImagen() {
        noticiaEn(Noticia.Estado.PUBLICADA);

        assertThatThrownBy(() -> servicio.leer(NOTICIA, 2, null, false))
                .isInstanceOf(ImagenNoEncontradaExcepcion.class);
    }

    @Test
    void siElArchivoYaNoEstaRespondeQueNoHayImagen() {
        noticiaEn(Noticia.Estado.PUBLICADA);
        almacen.archivos.clear();

        assertThatThrownBy(() -> servicio.leer(NOTICIA, 1, null, false))
                .isInstanceOf(ImagenNoEncontradaExcepcion.class);
    }

    @Test
    void unaNoticiaInexistenteResponde404() {
        when(noticias.buscarPorId(NOTICIA)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.leer(NOTICIA, 1, null, true))
                .isInstanceOf(NoticiaNoEncontradaExcepcion.class);
    }
}
