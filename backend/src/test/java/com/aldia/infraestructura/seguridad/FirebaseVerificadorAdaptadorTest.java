package com.aldia.infraestructura.seguridad;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.InicioExternoNoDisponibleExcepcion;
import com.aldia.dominio.modelo.IdentidadExterna;

class FirebaseVerificadorAdaptadorTest {

    private static JwtDecoder devuelve(Map<String, Object> reclamos) {
        return token -> new Jwt(token, Instant.now(), Instant.now().plusSeconds(3600), Map.of("alg", "RS256"),
                reclamos);
    }

    @Test
    void sinProyectoConfiguradoElInicioConGoogleEstaApagado() {
        FirebaseVerificadorAdaptador adaptador = new FirebaseVerificadorAdaptador("", "https://llaves.test");
        assertThatThrownBy(() -> adaptador.verificar("x")).isInstanceOf(InicioExternoNoDisponibleExcepcion.class);
    }

    @Test
    void conProyectoArmaElDecodificadorSinPedirNadaTodavia() {
        FirebaseVerificadorAdaptador adaptador = new FirebaseVerificadorAdaptador("aldia-noticias",
                "https://llaves.test");
        // Un texto que ni siquiera es un JWT se rechaza antes de ir por las llaves.
        assertThatThrownBy(() -> adaptador.verificar("no-es-un-jwt"))
                .isInstanceOf(CredencialesInvalidasExcepcion.class);
    }

    @Test
    void unTokenValidoConCorreoVerificadoDaLaIdentidad() {
        FirebaseVerificadorAdaptador adaptador = new FirebaseVerificadorAdaptador(devuelve(
                Map.of("email", "ana@gmail.com", "email_verified", true, "name", "Ana Pérez")));

        assertThat(adaptador.verificar("tok")).isEqualTo(new IdentidadExterna("ana@gmail.com", "Ana Pérez"));
    }

    @Test
    void unCorreoSinVerificarOSinCorreoSeRechaza() {
        FirebaseVerificadorAdaptador sinVerificar = new FirebaseVerificadorAdaptador(devuelve(
                Map.of("email", "ana@gmail.com", "email_verified", false)));
        FirebaseVerificadorAdaptador sinCorreo = new FirebaseVerificadorAdaptador(devuelve(
                Map.of("email_verified", true, "sub", "123")));

        assertThatThrownBy(() -> sinVerificar.verificar("tok")).isInstanceOf(CredencialesInvalidasExcepcion.class)
                .hasMessageContaining("Google");
        assertThatThrownBy(() -> sinCorreo.verificar("tok")).isInstanceOf(CredencialesInvalidasExcepcion.class);
    }

    @Test
    void unaFirmaOVencimientoInvalidoSeRechaza() {
        FirebaseVerificadorAdaptador adaptador = new FirebaseVerificadorAdaptador(token -> {
            throw new BadJwtException("firma inválida");
        });
        assertThatThrownBy(() -> adaptador.verificar("tok")).isInstanceOf(CredencialesInvalidasExcepcion.class);
    }
}
