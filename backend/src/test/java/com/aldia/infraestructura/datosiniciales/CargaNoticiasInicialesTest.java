package com.aldia.infraestructura.datosiniciales;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;
import com.fasterxml.jackson.databind.json.JsonMapper;

class CargaNoticiasInicialesTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final TransactionTemplate transaccion = mock(TransactionTemplate.class);
    private final AlmacenImagenesPuerto almacen = mock(AlmacenImagenesPuerto.class);
    private final CargaNoticiasIniciales carga = new CargaNoticiasIniciales(jdbc, transaccion, almacen,
            JsonMapper.builder().findAndAddModules().build());

    private NoticiaInicial noticia;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void preparar() throws IOException {
        noticia = carga.leer().get(0);
        when(jdbc.queryForObject(startsWith("SELECT COUNT(*)"), eq(Integer.class), any())).thenReturn(0);
        when(almacen.guardar(any(), eq("jpg"))).thenReturn("clave.jpg");
        doAnswer(invocacion -> {
            invocacion.getArgument(0, Consumer.class).accept(mock(TransactionStatus.class));
            return null;
        }).when(transaccion).executeWithoutResult(any());
    }

    private void ciudad(List<Long> ids) {
        when(jdbc.queryForList(startsWith("SELECT id FROM ciudad"), eq(Long.class), any())).thenReturn(ids);
    }

    private void autor(List<Long> ids) {
        when(jdbc.queryForList(startsWith("SELECT id FROM usuario WHERE correo"), eq(Long.class), any()))
                .thenReturn(ids);
    }

    private void administrador(List<Long> ids) {
        when(jdbc.queryForList(startsWith("SELECT id FROM usuario WHERE rol"), eq(Long.class), any())).thenReturn(ids);
    }

    @Test
    void lasNoticiasDelArchivoCitanSuFuenteYTraenFoto() throws IOException {
        List<NoticiaInicial> noticias = carga.leer();
        assertThat(noticias).hasSize(18);
        assertThat(noticias).allSatisfy(n -> {
            assertThat(n.contenido()).contains("Nota original: " + n.fuente());
            assertThat(n.fuente()).startsWith("https://");
            assertThat(n.foto()).endsWith(".jpg");
        });
    }

    @Test
    void siYaExisteNoHaceNada() throws IOException {
        when(jdbc.queryForObject(startsWith("SELECT COUNT(*)"), eq(Integer.class), any())).thenReturn(1);
        assertThat(carga.cargar(noticia)).isFalse();
        verify(almacen, never()).guardar(any(), anyString());
    }

    private void fotoGuardada(Optional<byte[]> contenido) {
        when(jdbc.queryForObject(startsWith("SELECT COUNT(*)"), eq(Integer.class), any())).thenReturn(1);
        when(jdbc.queryForList(startsWith("SELECT m.url"), eq(String.class), any())).thenReturn(List.of("vieja.jpg"));
        when(almacen.leer("vieja.jpg")).thenReturn(contenido);
    }

    @Test
    void siYaExisteYSuFotoCambioLaReemplaza() throws IOException {
        fotoGuardada(Optional.of(new byte[] {1, 2, 3}));

        assertThat(carga.cargar(noticia)).isFalse();
        verify(almacen).guardar(any(), eq("jpg"));
        verify(jdbc).update("UPDATE multimedia SET url = ? WHERE url = ?", "clave.jpg", "vieja.jpg");
        verify(almacen).borrar("vieja.jpg");
    }

    @Test
    void siYaExisteYTieneLaMismaFotoNoLaToca() throws IOException {
        byte[] igual;
        try (InputStream entrada = new ClassPathResource(CargaNoticiasIniciales.CARPETA + "fotos/" + noticia.foto())
                .getInputStream()) {
            igual = entrada.readAllBytes();
        }
        fotoGuardada(Optional.of(igual));

        assertThat(carga.actualizarFoto(noticia)).isFalse();
        verify(almacen, never()).guardar(any(), anyString());
        verify(almacen, never()).borrar(anyString());
    }

    @Test
    void siLaFotoGuardadaSePerdioLaVuelveAGuardar() throws IOException {
        fotoGuardada(Optional.empty());

        assertThat(carga.actualizarFoto(noticia)).isTrue();
        verify(almacen).borrar("vieja.jpg");
    }

    @Test
    void siFaltaLaCuentaDelAutorLaPublicaUnAdministrador() throws IOException {
        ciudad(List.of(1L));
        autor(List.of());
        administrador(List.of(5L));
        when(jdbc.queryForObject(startsWith("INSERT INTO noticia"), eq(Long.class), any(Object[].class))).thenReturn(40L);

        assertThat(carga.cargar(noticia)).isTrue();
        verify(jdbc).update(startsWith("INSERT INTO multimedia"), eq("clave.jpg"), eq(40L), eq(noticia.textoAlternativo()));
    }

    @Test
    void sinCiudadOSinNadieQueLaPubliqueNoSeCarga() throws IOException {
        ciudad(List.of());
        autor(List.of(2L));
        assertThat(carga.cargar(noticia)).isFalse();

        ciudad(List.of(1L));
        autor(List.of());
        administrador(List.of());
        assertThat(carga.cargar(noticia)).isFalse();
        verify(almacen, never()).guardar(any(), anyString());
    }

    @Test
    void siFallaLaBaseBorraLaFotoQueYaGuardo() {
        ciudad(List.of(1L));
        autor(List.of(2L));
        doThrow(new IllegalStateException("sin base")).when(transaccion).executeWithoutResult(any());

        assertThatThrownBy(() -> carga.cargar(noticia)).isInstanceOf(IllegalStateException.class);
        verify(almacen).borrar("clave.jpg");
    }
}
