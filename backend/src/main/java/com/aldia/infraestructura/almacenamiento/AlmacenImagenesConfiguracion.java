package com.aldia.infraestructura.almacenamiento;

import java.net.URI;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

/**
 * Elige dónde se guardan las fotos según IMAGENES_ALMACEN:
 * s3 (bucket privado; lo que se usa en Docker y en producción) o disco (carpeta local, solo
 * para trabajar sin Docker).
 */
@Configuration
@EnableConfigurationProperties(PropiedadesAlmacenImagenes.class)
public class AlmacenImagenesConfiguracion {

    private static final Logger LOG = LoggerFactory.getLogger(AlmacenImagenesConfiguracion.class);

    @Bean
    public AlmacenImagenesPuerto almacenImagenes(PropiedadesAlmacenImagenes propiedades) {
        String tipo = propiedades.tipo() == null ? "disco" : propiedades.tipo().trim().toLowerCase();
        return switch (tipo) {
            case "disco" -> {
                LOG.info("Fotos: carpeta local {}", propiedades.directorio());
                yield new AlmacenImagenesDiscoAdaptador(propiedades.directorio());
            }
            case "s3" -> {
                PropiedadesAlmacenImagenes.S3 s3 = propiedades.s3();
                AlmacenImagenesS3Adaptador almacen = new AlmacenImagenesS3Adaptador(clienteS3(s3), s3.bucket());
                almacen.verificarBucket();
                LOG.info("Fotos: bucket «{}» en {}", s3.bucket(), s3.tieneEndpoint() ? s3.endpoint() : "AWS S3");
                yield almacen;
            }
            default -> throw new IllegalStateException(
                    "IMAGENES_ALMACEN debe ser s3 o disco (llegó: " + tipo + ")");
        };
    }

    static S3Client clienteS3(PropiedadesAlmacenImagenes.S3 s3) {
        if (s3.bucket() == null || s3.bucket().isBlank()) {
            throw new IllegalStateException("IMAGENES_ALMACEN=s3 necesita S3_BUCKET");
        }
        Duration tope = Duration.ofMillis(s3.tiempoEsperaMs());
        S3ClientBuilder constructor = S3Client.builder()
                .region(Region.of(s3.region()))
                .credentialsProvider(credenciales(s3))
                .forcePathStyle(s3.estiloRuta())
                .overrideConfiguration(configuracion -> configuracion.apiCallTimeout(tope).apiCallAttemptTimeout(tope));
        if (s3.tieneEndpoint()) {
            constructor.endpointOverride(URI.create(s3.endpoint().trim()));
        }
        return constructor.build();
    }

    /**
     * Con S3_CLAVE_ACCESO y S3_CLAVE_SECRETA usa esas claves (SeaweedFS, R2). Sin ellas usa la
     * cadena estándar de AWS: variables AWS_*, perfil o el rol del servidor, sin claves en el .env.
     */
    private static AwsCredentialsProvider credenciales(PropiedadesAlmacenImagenes.S3 s3) {
        if (s3.tieneClaveAcceso() != s3.tieneClaveSecreta()) {
            throw new IllegalStateException("S3_CLAVE_ACCESO y S3_CLAVE_SECRETA van juntas: falta una de las dos");
        }
        if (s3.tieneClaveAcceso()) {
            return StaticCredentialsProvider.create(AwsBasicCredentials.create(s3.claveAcceso(), s3.claveSecreta()));
        }
        return DefaultCredentialsProvider.builder().build();
    }
}
