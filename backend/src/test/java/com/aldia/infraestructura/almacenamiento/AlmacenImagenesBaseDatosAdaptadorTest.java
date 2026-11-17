package com.aldia.infraestructura.almacenamiento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

import com.aldia.dominio.excepcion.AlmacenamientoExcepcion;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

class AlmacenImagenesBaseDatosAdaptadorTest {

    private static EmbeddedPostgres base;
    private static JdbcTemplate jdbc;

    @BeforeAll
    static void arrancar() throws IOException {
        base = EmbeddedPostgres.builder().start();
        jdbc = new JdbcTemplate(base.getPostgresDatabase());
        jdbc.execute("CREATE TABLE archivo_imagen (clave VARCHAR(64) PRIMARY KEY, contenido BYTEA NOT NULL, "
                + "creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
    }

    @AfterAll
    static void apagar() throws IOException {
        base.close();
    }

    @Test
    void guardaLeeYBorraLosBytesTalCual() {
        AlmacenImagenesBaseDatosAdaptador almacen = new AlmacenImagenesBaseDatosAdaptador(jdbc);
        byte[] foto = {(byte) 0xFF, (byte) 0xD8, 1, 2, 3, 0, (byte) 0xFF, (byte) 0xD9};

        String clave = almacen.guardar(foto, "jpg");

        assertThat(clave).matches("^[0-9a-f-]{36}\\.jpg$");
        assertThat(almacen.leer(clave)).contains(foto);
        almacen.borrar(clave);
        assertThat(almacen.leer(clave)).isEmpty();
        almacen.borrar(clave);
    }

    @Test
    void unaClaveQueNoExisteNoTraeNada() {
        assertThat(new AlmacenImagenesBaseDatosAdaptador(jdbc).leer("no-existe.webp")).isEmpty();
    }

    @Test
    void rechazaExtensionesQueNoSonDeFoto() {
        AlmacenImagenesBaseDatosAdaptador almacen = new AlmacenImagenesBaseDatosAdaptador(jdbc);
        assertThatThrownBy(() -> almacen.guardar(new byte[] {1}, "exe")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void siLaBaseFallaLoDiceConUnErrorDeAlmacenamiento() {
        // Una base a la que no se puede conectar.
        AlmacenImagenesBaseDatosAdaptador roto = new AlmacenImagenesBaseDatosAdaptador(
                new JdbcTemplate(new SingleConnectionDataSource("jdbc:postgresql://localhost:1/nada", "x", "y", true)));

        assertThatThrownBy(() -> roto.guardar(new byte[] {1}, "png")).isInstanceOf(AlmacenamientoExcepcion.class);
        assertThatThrownBy(() -> roto.leer("a.png")).isInstanceOf(AlmacenamientoExcepcion.class);
        assertThatThrownBy(() -> roto.borrar("a.png")).isInstanceOf(AlmacenamientoExcepcion.class);
    }
}
