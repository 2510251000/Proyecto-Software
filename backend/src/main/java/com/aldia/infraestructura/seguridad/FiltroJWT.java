package com.aldia.infraestructura.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class FiltroJWT extends OncePerRequestFilter {

    private final SecretKey claveSecreta;

    public FiltroJWT(@Value("${jwt.clave-secreta}") String claveSecretaTexto) {
        this.claveSecreta = Keys.hmacShaKeyFor(claveSecretaTexto.getBytes());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String encabezado = request.getHeader("Authorization");

        if (encabezado == null || !encabezado.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = encabezado.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(claveSecreta)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String correo = claims.getSubject();
            String rol = claims.get("rol", String.class);

            // El rol del token se pasa a Spring Security como ROLE_<rol>, para poder
            // proteger endpoints con hasRole("ADMINISTRADOR").
            List<SimpleGrantedAuthority> permisos = rol != null
                    ? List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                    : Collections.emptyList();

            UsernamePasswordAuthenticationToken autenticacion =
                    new UsernamePasswordAuthenticationToken(correo, null, permisos);

            SecurityContextHolder.getContext().setAuthentication(autenticacion);

       } catch (JwtException ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}