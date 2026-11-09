package com.aldia.infraestructura.almacenamiento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import software.amazon.awssdk.services.s3.S3Client;

class AlmacenImagenesConfiguracionTest {

    private final AlmacenImagenesConfiguracion configuracion = new AlmacenImagenesConfiguracion();

    @TempDir
    Path carpeta;

    private static PropiedadesAlmacenImagenes.S3 s3(String endpoint, String bucket, String acceso, String secreta) {
        return new PropiedadesAlmacenImagenes.S3(endpoint, "us-east-1", bucket, acceso, secreta, true, 500);
    }

    @Test
    void sinTipoUsaLaCarpetaLocal() {
        PropiedadesAlmacenImagenes propiedades = new PropiedadesAlmacenImagenes(null, carpeta.toString(), null);

        assertThat(configuracion.almacenImagenes(propiedades)).isInstanceOf(AlmacenImagenesDiscoAdaptador.class);
    }

    @Test
    void conUnTipoDesconocidoNoArranca() {
        PropiedadesAlmacenImagenes propiedades = new PropiedadesAlmacenImagenes("ftp", carpeta.toString(), null);

        assertThatThrownBy(() -> configuracion.almacenImagenes(propiedades))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("IMAGENES_ALMACEN");
    }

    @Test
    void conS3SinServicioQueResponderNoArranca() {
        // Nada escucha en el puerto 1: la verificación del bucket falla al arrancar.
        PropiedadesAlmacenImagenes propiedades = new PropiedadesAlmacenImagenes(" S3 ", carpeta.toString(),
                s3("http://127.0.0.1:1", "aldia-imagenes", "clave", "secreto"));

        assertThatThrownBy(() -> configuracion.almacenImagenes(propiedades))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("aldia-imagenes");
    }

    @Test
    void elClienteS3NecesitaUnBucket() {
        assertThatThrownBy(() -> AlmacenImagenesConfiguracion.clienteS3(s3("http://s3:8333", " ", "clave", "secreto")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("S3_BUCKET");
    }

    @Test
    void lasClavesDeAccesoVanJuntas() {
        assertThatThrownBy(() -> AlmacenImagenesConfiguracion.clienteS3(s3("http://s3:8333", "b", "clave", "")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("S3_CLAVE_SECRETA");
    }

    @Test
    void sinClavesNiEndpointUsaLaCadenaDeCredencialesDeAws() {
        try (S3Client cliente = AlmacenImagenesConfiguracion.clienteS3(s3(null, "b", null, null))) {
            assertThat(cliente).isNotNull();
        }
    }
}
