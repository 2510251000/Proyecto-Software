package com.aldia.infraestructura.almacenamiento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class AlmacenImagenesDiscoAdaptadorTest {

    @TempDir
    Path carpeta;

    @Test
    void guardaLeeYBorraConUnNombreQueNoDependeDelUsuario() {
        AlmacenImagenesDiscoAdaptador almacen = new AlmacenImagenesDiscoAdaptador(carpeta.resolve("fotos").toString());

        String clave = almacen.guardar(new byte[] {1, 2, 3}, "jpg");

        assertThat(clave).matches("[0-9a-f-]{36}\\.jpg");
        assertThat(Files.exists(carpeta.resolve("fotos").resolve(clave))).isTrue();
        assertThat(almacen.leer(clave)).hasValueSatisfying(b -> assertThat(b).containsExactly(1, 2, 3));

        almacen.borrar(clave);
        assertThat(almacen.leer(clave)).isEmpty();
        almacen.borrar(clave);
    }

    @Test
    void noDejaSalirDeLaCarpetaNiUsarExtensionesRaras() throws Exception {
        Files.writeString(carpeta.resolve("secreto.txt"), "no");
        AlmacenImagenesDiscoAdaptador almacen = new AlmacenImagenesDiscoAdaptador(carpeta.resolve("fotos").toString());

        assertThat(almacen.leer("../secreto.txt")).isEmpty();
        assertThat(almacen.leer(null)).isEmpty();
        almacen.borrar("../secreto.txt");
        assertThat(Files.exists(carpeta.resolve("secreto.txt"))).isTrue();
        assertThatThrownBy(() -> almacen.guardar(new byte[1], "exe")).isInstanceOf(IllegalArgumentException.class);
    }
}
