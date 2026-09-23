package com.aldia.infraestructura.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SeguridadConfiguracion {

    private final FiltroJWT filtroJWT;
    private final PuntoEntradaNoAutorizado puntoEntradaNoAutorizado;

    public SeguridadConfiguracion(FiltroJWT filtroJWT, PuntoEntradaNoAutorizado puntoEntradaNoAutorizado) {
        this.filtroJWT = filtroJWT;
        this.puntoEntradaNoAutorizado = puntoEntradaNoAutorizado;
    }

    @Bean
    public SecurityFilterChain filtroSeguridad(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(excepciones -> excepciones.authenticationEntryPoint(puntoEntradaNoAutorizado))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/noticias/**", "/error").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(filtroJWT, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}