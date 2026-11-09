package com.aldia.infraestructura.almacenamiento;

import java.util.Optional;

import com.aldia.dominio.excepcion.AlmacenamientoExcepcion;
import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;

import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * Guarda las fotos en un bucket privado con la API de S3: AWS S3 o Cloudflare R2 en producción,
 * SeaweedFS en Docker. Nadie lee el bucket directamente: la API entrega cada foto después de
 * revisar si la noticia es pública o si quien la pide es su autor o un administrador.
 */
public class AlmacenImagenesS3Adaptador implements AlmacenImagenesPuerto, AutoCloseable {

    private final S3Client s3;
    private final String bucket;

    public AlmacenImagenesS3Adaptador(S3Client s3, String bucket) {
        this.s3 = s3;
        this.bucket = bucket;
    }

    /** Falla al arrancar si el bucket no existe o no se puede entrar, en vez de en la primera foto. */
    public void verificarBucket() {
        try {
            s3.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException noExiste) {
            throw new IllegalStateException("El bucket de fotos «" + bucket + "» no existe: créalo o revisa S3_BUCKET",
                    noExiste);
        } catch (SdkException error) {
            throw new IllegalStateException("No se pudo entrar al bucket de fotos «" + bucket
                    + "»: revisa S3_ENDPOINT y las credenciales", error);
        }
    }

    @Override
    public String guardar(byte[] contenido, String extension) {
        String clave = ClavesDeImagen.nueva(extension);
        try {
            PutObjectRequest peticion = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(clave)
                    .contentType(FormatoImagen.desdeExtension(extension).tipoMime())
                    .build();
            s3.putObject(peticion, RequestBody.fromBytes(contenido));
            return clave;
        } catch (SdkException error) {
            throw new AlmacenamientoExcepcion("No se pudo guardar la foto", error);
        }
    }

    @Override
    public Optional<byte[]> leer(String clave) {
        if (!ClavesDeImagen.esValida(clave)) {
            return Optional.empty();
        }
        try {
            return Optional.of(s3.getObjectAsBytes(GetObjectRequest.builder().bucket(bucket).key(clave).build()).asByteArray());
        } catch (NoSuchKeyException noExiste) {
            return Optional.empty();
        } catch (SdkException error) {
            throw new AlmacenamientoExcepcion("No se pudo leer la foto", error);
        }
    }

    @Override
    public void borrar(String clave) {
        if (!ClavesDeImagen.esValida(clave)) {
            return;
        }
        try {
            // En S3 borrar algo que no existe no es un error.
            s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(clave).build());
        } catch (SdkException error) {
            throw new AlmacenamientoExcepcion("No se pudo borrar la foto", error);
        }
    }

    /** Spring lo llama al apagar: suelta las conexiones del cliente. */
    @Override
    public void close() {
        s3.close();
    }
}
