package com.aldia.infraestructura.seguridad;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.aldia.dominio.modelo.Usuario;
import com.aldia.dominio.puerto.salida.TokenPuerto;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenJWTAdaptador implements TokenPuerto {

    private final SecretKey claveSecreta;
    private final long tiempoExpiracionMs;

    public TokenJWTAdaptador(@Value("${jwt.clave-secreta}") String claveSecreta,
                              @Value("${jwt.expiracion-ms}") long tiempoExpiracionMs) {
        this.claveSecreta = Keys.hmacShaKeyFor(claveSecreta.getBytes());
        this.tiempoExpiracionMs = tiempoExpiracionMs;
    }

    @Override
    public String generarToken(Usuario usuario) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + tiempoExpiracionMs);

        return Jwts.builder()
                .subject(usuario.getCorreo())
                .claim("rol", usuario.getRol().name())
                .claim("id", usuario.getId())
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(claveSecreta)
                .compact();
    }
}