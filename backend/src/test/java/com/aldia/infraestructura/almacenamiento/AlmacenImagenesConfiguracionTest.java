package com.aldia.infraestructura.almacenamiento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class AlmacenImagenesConfiguracionTest {

    private final AlmacenImagenesConfiguracion configuracion = new AlmacenImagenesConfiguracion();
    private final JdbcTemplate jdbc = new JdbcTemplate();

    @Test
    void eligeElAlmacenSegunLaConfiguracion() {
        assertThat(configuracion.almacenImagenes("disco", "imagenes", jdbc))
                .isInstanceOf(AlmacenImagenesDiscoAdaptador.class);
        assertThat(configuracion.almacenImagenes("base-datos", "imagenes", jdbc))
                .isInstanceOf(AlmacenImagenesBaseDatosAdaptador.class);
    }

    @Test
    void unValorDesconocidoNoDejaArrancar() {
        assertThatThrownBy(() -> configuracion.almacenImagenes("nube", "imagenes", jdbc))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("nube");
    }
}
