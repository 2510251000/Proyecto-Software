package com.aldia.infraestructura.almacenamiento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.aldia.dominio.excepcion.AlmacenamientoExcepcion;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

class AlmacenImagenesS3AdaptadorTest {

    private static final String BUCKET = "aldia-imagenes";
    private static final String CLAVE = "123e4567-e89b-12d3-a456-426614174000.png";

    private final S3Client s3 = mock(S3Client.class);
    private final AlmacenImagenesS3Adaptador almacen = new AlmacenImagenesS3Adaptador(s3, BUCKET);

    @Test
    void guardaEnElBucketConUnaClaveNuevaYElTipoDeLaFoto() {
        String clave = almacen.guardar(new byte[] {1, 2, 3}, "png");

        ArgumentCaptor<PutObjectRequest> peticion = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3).putObject(peticion.capture(), any(RequestBody.class));
        assertThat(clave).matches("[0-9a-f-]{36}\\.png");
        assertThat(peticion.getValue().bucket()).isEqualTo(BUCKET);
        assertThat(peticion.getValue().key()).isEqualTo(clave);
        assertThat(peticion.getValue().contentType()).isEqualTo("image/png");
    }

    @Test
    void noGuardaExtensionesRaras() {
        assertThatThrownBy(() -> almacen.guardar(new byte[1], "exe")).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(s3);
    }

    @Test
    void siElServicioFallaAlGuardarAvisaConUnErrorDeAlmacenamiento() {
        when(s3.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(SdkClientException.create("sin conexión"));

        assertThatThrownBy(() -> almacen.guardar(new byte[1], "jpg")).isInstanceOf(AlmacenamientoExcepcion.class);
    }

    @Test
    void leeLaFotoDelBucket() {
        when(s3.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenReturn(ResponseBytes.fromByteArray(GetObjectResponse.builder().build(), new byte[] {7, 8}));

        assertThat(almacen.leer(CLAVE)).hasValueSatisfying(bytes -> assertThat(bytes).containsExactly(7, 8));

        ArgumentCaptor<GetObjectRequest> peticion = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3).getObjectAsBytes(peticion.capture());
        assertThat(peticion.getValue().bucket()).isEqualTo(BUCKET);
        assertThat(peticion.getValue().key()).isEqualTo(CLAVE);
    }

    @Test
    void unaFotoQueNoEstaEnElBucketNoExiste() {
        when(s3.getObjectAsBytes(any(GetObjectRequest.class))).thenThrow(NoSuchKeyException.builder().build());

        assertThat(almacen.leer(CLAVE)).isEmpty();
    }

    @Test
    void siElServicioFallaAlLeerAvisaConUnErrorDeAlmacenamiento() {
        when(s3.getObjectAsBytes(any(GetObjectRequest.class))).thenThrow(SdkClientException.create("sin conexión"));

        assertThatThrownBy(() -> almacen.leer(CLAVE)).isInstanceOf(AlmacenamientoExcepcion.class);
    }

    @Test
    void conClavesQueNoGeneroElPortalNoLlamaAlBucket() {
        assertThat(almacen.leer("../otro-objeto.txt")).isEmpty();
        assertThat(almacen.leer(null)).isEmpty();
        almacen.borrar("config/secreto.json");

        verifyNoInteractions(s3);
    }

    @Test
    void borraLaFotoDelBucket() {
        almacen.borrar(CLAVE);

        ArgumentCaptor<DeleteObjectRequest> peticion = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3).deleteObject(peticion.capture());
        assertThat(peticion.getValue().bucket()).isEqualTo(BUCKET);
        assertThat(peticion.getValue().key()).isEqualTo(CLAVE);
    }

    @Test
    void siElServicioFallaAlBorrarAvisaConUnErrorDeAlmacenamiento() {
        when(s3.deleteObject(any(DeleteObjectRequest.class))).thenThrow(SdkClientException.create("sin conexión"));

        assertThatThrownBy(() -> almacen.borrar(CLAVE)).isInstanceOf(AlmacenamientoExcepcion.class);
    }

    @Test
    void alArrancarRevisaQueElBucketExista() {
        almacen.verificarBucket();

        ArgumentCaptor<HeadBucketRequest> peticion = ArgumentCaptor.forClass(HeadBucketRequest.class);
        verify(s3).headBucket(peticion.capture());
        assertThat(peticion.getValue().bucket()).isEqualTo(BUCKET);
    }

    @Test
    void siElBucketNoExisteNoArranca() {
        when(s3.headBucket(any(HeadBucketRequest.class))).thenThrow(NoSuchBucketException.builder().build());

        assertThatThrownBy(almacen::verificarBucket)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("no existe");
    }

    @Test
    void siNoSePuedeEntrarAlBucketNoArranca() {
        when(s3.headBucket(any(HeadBucketRequest.class))).thenThrow(SdkClientException.create("sin conexión"));

        assertThatThrownBy(almacen::verificarBucket)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("S3_ENDPOINT");
    }

    @Test
    void alApagarCierraElCliente() {
        almacen.close();

        verify(s3).close();
    }
}
