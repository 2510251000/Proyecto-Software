package com.aldia.dominio.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.aldia.dominio.ImagenesDePrueba;
import com.aldia.dominio.excepcion.ImagenInvalidaExcepcion;
import com.aldia.dominio.modelo.DimensionesImagen;
import com.aldia.dominio.modelo.FormatoImagen;
import com.aldia.dominio.modelo.ImagenSubida;

class ValidadorImagenesTest {

    private final ValidadorImagenes validador = new ValidadorImagenes(ImagenesDePrueba.PARAMETROS);

    private static byte[] png() {
        return new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};
    }

    private static byte[] webp() {
        byte[] bytes = "RIFF0000WEBPVP8 ".getBytes(StandardCharsets.US_ASCII);
        return bytes;
    }

    @Test
    void reconoceJpegPngYWebpPorSusPrimerosBytes() {
        List<FormatoImagen> formatos = validador.validar(List.of(
                new ImagenSubida("a.jpg", ImagenesDePrueba.jpeg(20), null),
                new ImagenSubida("b.png", png(), null),
                new ImagenSubida("c.webp", webp(), null)));

        assertThat(formatos).containsExactly(FormatoImagen.JPEG, FormatoImagen.PNG, FormatoImagen.WEBP);
    }

    @Test
    void unArchivoQueDiceSerJpegPeroNoLoEsSeRechaza() {
        ImagenSubida falsa = new ImagenSubida("vacaciones.jpg",
                "<html>no soy una foto</html>".getBytes(StandardCharsets.UTF_8), null);

        assertThatThrownBy(() -> validador.validar(List.of(falsa)))
                .isInstanceOf(ImagenInvalidaExcepcion.class)
                .hasMessage("La foto «vacaciones.jpg» no es una imagen JPEG, PNG o WebP");
    }

    @Test
    void unaFotoMuyPesadaSeRechaza() {
        ImagenSubida pesada = new ImagenSubida("grande.jpg", ImagenesDePrueba.jpeg(2048), null);

        assertThatThrownBy(() -> validador.validar(List.of(pesada)))
                .isInstanceOf(ImagenInvalidaExcepcion.class)
                .hasMessageContaining("«grande.jpg» pesa más de");
    }

    @Test
    void masFotosDeLasPermitidasSeRechazan() {
        List<ImagenSubida> cinco = Collections.nCopies(5, ImagenesDePrueba.foto("x.jpg"));

        assertThatThrownBy(() -> validador.validar(cinco))
                .isInstanceOf(ImagenInvalidaExcepcion.class)
                .hasMessage("Puedes subir máximo 4 fotos por noticia");
    }

    @Test
    void cuatroFotosSiSePermiten() {
        assertThat(validador.validar(Collections.nCopies(4, ImagenesDePrueba.foto("x.jpg")))).hasSize(4);
    }

    @Test
    void unArchivoVacioOMuyCortoSeRechaza() {
        assertThatThrownBy(() -> validador.validar(List.of(new ImagenSubida(null, null, null))))
                .isInstanceOf(ImagenInvalidaExcepcion.class)
                .hasMessage("Una de las fotos está vacía");
        assertThatThrownBy(() -> validador.validar(List.of(new ImagenSubida("x", new byte[] {(byte) 0xFF}, null))))
                .isInstanceOf(ImagenInvalidaExcepcion.class);
    }

    @Test
    void revisaLasDimensiones() {
        validador.validarDimensiones(new DimensionesImagen(4000, 3000), "ok.jpg");

        assertThatThrownBy(() -> validador.validarDimensiones(new DimensionesImagen(4001, 10), "ancha.jpg"))
                .isInstanceOf(ImagenInvalidaExcepcion.class)
                .hasMessageContaining("4001×10");
        assertThatThrownBy(() -> validador.validarDimensiones(new DimensionesImagen(0, 10), "rota.jpg"))
                .isInstanceOf(ImagenInvalidaExcepcion.class);
    }

    @Test
    void limpiaLaDescripcionYRevisaSuLargo() {
        assertThat(validador.textoAlternativo("  Niños   en el parque ")).isEqualTo("Niños en el parque");
        assertThat(validador.textoAlternativo("   ")).isNull();
        assertThat(validador.textoAlternativo(null)).isNull();
        String larga = "a".repeat(251);
        assertThatThrownBy(() -> validador.textoAlternativo(larga)).isInstanceOf(ImagenInvalidaExcepcion.class);
    }

    @Test
    void elFormatoSaleDeLaExtensionGuardada() {
        assertThat(FormatoImagen.desdeExtension("PNG")).isEqualTo(FormatoImagen.PNG);
        assertThat(FormatoImagen.desdeExtension("raro")).isEqualTo(FormatoImagen.JPEG);
        assertThat(validador.parametros().maximoPorNoticia()).isEqualTo(4);
    }
}
