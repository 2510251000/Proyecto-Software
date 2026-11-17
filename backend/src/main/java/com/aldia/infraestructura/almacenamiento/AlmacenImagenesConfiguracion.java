package com.aldia.infraestructura.almacenamiento;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;

/**
 * Elige dónde se guardan los archivos de las fotos según IMAGENES_ALMACEN:
 * «disco» (carpeta del servidor; Docker y local) o «base-datos» (tabla archivo_imagen;
 * servidores sin disco permanente, como Render gratis). Hay un solo almacén a la vez.
 */
@Configuration
public class AlmacenImagenesConfiguracion {

    @Bean
    public AlmacenImagenesPuerto almacenImagenes(@Value("${aldia.imagenes.almacen:disco}") String tipo,
                                                 @Value("${aldia.imagenes.directorio}") String directorio,
                                                 JdbcTemplate jdbc) {
        return switch (tipo) {
            case "disco" -> new AlmacenImagenesDiscoAdaptador(directorio);
            case "base-datos" -> new AlmacenImagenesBaseDatosAdaptador(jdbc);
            default -> throw new IllegalStateException(
                    "IMAGENES_ALMACEN debe ser «disco» o «base-datos», no «" + tipo + "»");
        };
    }
}
