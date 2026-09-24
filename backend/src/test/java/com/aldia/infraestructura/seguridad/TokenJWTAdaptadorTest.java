package com.aldia.infraestructura.seguridad;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;

import com.aldia.dominio.modelo.Nivel;
import com.aldia.dominio.modelo.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class TokenJWTAdaptadorTest {

    // Clave solo para pruebas (64 caracteres); la real sale de JWT_CLAVE_SECRETA.
    private static final String CLAVE_PRUEBA =
            "clave-de-prueba-unitaria-que-tiene-al-menos-sesenta-y-cuatro-car";
    private static final long UNA_HORA_MS = 3_600_000L;

    private final TokenJWTAdaptador adaptador = new TokenJWTAdaptador(CLAVE_PRUEBA, UNA_HORA_MS);

    private Usuario usuario() {
        return new Usuario(5L, "prueba@correo.com", "hash", Usuario.Rol.USUARIO_COMUN,
                new Nivel(1L, "Básico", 3), LocalDateTime.now());
    }

    private Claims leer(String token, String clave) {
        SecretKey llave = Keys.hmacShaKeyFor(clave.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(llave).build().parseSignedClaims(token).getPayload();
    }

    @Test
    void elTokenLlevaCorreoRolEIdDelUsuario() {
        Claims claims = leer(adaptador.generarToken(usuario()), CLAVE_PRUEBA);

        assertThat(claims.getSubject()).isEqualTo("prueba@correo.com");
        assertThat(claims.get("rol", String.class)).isEqualTo("USUARIO_COMUN");
        assertThat(((Number) claims.get("id")).longValue()).isEqualTo(5L);
    }

    @Test
    void elTokenVenceSegunElTiempoConfigurado() {
        Claims claims = leer(adaptador.generarToken(usuario()), CLAVE_PRUEBA);

        long duracion = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertThat(duracion).isEqualTo(UNA_HORA_MS);
    }

    @Test
    void unTokenFirmadoConOtraClaveNoEsValido() {
        String token = adaptador.generarToken(usuario());
        String otraClave = "otra-clave-distinta-para-la-prueba-que-tambien-tiene-64-caracter";

        assertThatThrownBy(() -> leer(token, otraClave)).isInstanceOf(JwtException.class);
    }
}
