package com.aldia.infraestructura.configuracion;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RelojConfiguracion {

    /**
     * Reloj único de la aplicación. Define qué es "hoy" para el límite diario.
     * En las pruebas se reemplaza por un reloj fijo.
     */
    @Bean
    public Clock reloj(@Value("${aldia.zona-horaria}") String zonaHoraria) {
        return Clock.system(ZoneId.of(zonaHoraria));
    }
}
