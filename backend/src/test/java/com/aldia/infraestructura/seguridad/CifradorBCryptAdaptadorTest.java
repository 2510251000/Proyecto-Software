package com.aldia.infraestructura.seguridad;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CifradorBCryptAdaptadorTest {

    private final CifradorBCryptAdaptador cifrador = new CifradorBCryptAdaptador();

    @Test
    void noGuardaLaContrasenaEnTextoPlano() {
        String cifrada = cifrador.cifrar("clave12345");

        assertThat(cifrada).isNotEqualTo("clave12345");
        assertThat(cifrada).startsWith("$2");
    }

    @Test
    void reconoceLaContrasenaCorrectaYRechazaLaIncorrecta() {
        String cifrada = cifrador.cifrar("clave12345");

        assertThat(cifrador.coincide("clave12345", cifrada)).isTrue();
        assertThat(cifrador.coincide("otraClave", cifrada)).isFalse();
    }

    @Test
    void cifrarDosVecesDaResultadosDistintos() {
        // BCrypt usa una sal aleatoria: el mismo texto nunca produce el mismo hash.
        assertThat(cifrador.cifrar("clave12345")).isNotEqualTo(cifrador.cifrar("clave12345"));
    }
}
