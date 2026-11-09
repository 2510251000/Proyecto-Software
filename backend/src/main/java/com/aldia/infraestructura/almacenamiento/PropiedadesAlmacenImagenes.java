package com.aldia.infraestructura.almacenamiento;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Valores de aldia.imagenes.almacen en application.yml (todos salen de variables de entorno).
 *
 * @param tipo       disco o s3
 * @param directorio carpeta de las fotos cuando el tipo es disco
 * @param s3         conexión al bucket cuando el tipo es s3
 */
@ConfigurationProperties(prefix = "aldia.imagenes.almacen")
public record PropiedadesAlmacenImagenes(String tipo, String directorio, S3 s3) {

    /**
     * @param endpoint     URL del servicio; vacía para AWS S3 (se arma con la región)
     * @param region       región del bucket (us-east-1, o auto en Cloudflare R2)
     * @param bucket       nombre del bucket, privado
     * @param claveAcceso  vacía para usar la cadena de credenciales de AWS (rol del servidor)
     * @param claveSecreta va siempre junto con la clave de acceso
     * @param estiloRuta   true para servicios como SeaweedFS (endpoint/bucket/clave)
     * @param tiempoEsperaMs tope de cada operación contra el almacén
     */
    public record S3(String endpoint, String region, String bucket, String claveAcceso, String claveSecreta,
                     boolean estiloRuta, long tiempoEsperaMs) {

        boolean tieneEndpoint() {
            return endpoint != null && !endpoint.isBlank();
        }

        boolean tieneClaveAcceso() {
            return claveAcceso != null && !claveAcceso.isBlank();
        }

        boolean tieneClaveSecreta() {
            return claveSecreta != null && !claveSecreta.isBlank();
        }
    }
}
