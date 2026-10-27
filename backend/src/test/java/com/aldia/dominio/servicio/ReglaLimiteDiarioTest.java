package com.aldia.dominio.servicio;

import static com.aldia.dominio.Fixtures.NIVEL_1;
import static com.aldia.dominio.Fixtures.NIVEL_2;
import static com.aldia.dominio.Fixtures.NIVEL_3;
import static com.aldia.dominio.Fixtures.usuario;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.aldia.dominio.excepcion.LimiteDiarioAlcanzadoExcepcion;
import com.aldia.dominio.modelo.CupoDiario;
import com.aldia.dominio.modelo.Usuario;

class ReglaLimiteDiarioTest {

    private final ReglaLimiteDiario regla = new ReglaLimiteDiario(true);

    @ParameterizedTest
    @ValueSource(longs = {0, 1, 2})
    void elNivel1PuedePublicarMientrasLleveMenosDeTres(long publicadasHoy) {
        Usuario basico = usuario(1L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 0);

        assertThatCode(() -> regla.verificar(basico, publicadasHoy)).doesNotThrowAnyException();
        assertThat(regla.cupo(basico, publicadasHoy).restantes()).isEqualTo(3 - publicadasHoy);
    }

    @Test
    void elNivel1NoPuedePublicarUnaCuartaNoticia() {
        Usuario basico = usuario(1L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 0);

        assertThatThrownBy(() -> regla.verificar(basico, 3))
                .isInstanceOf(LimiteDiarioAlcanzadoExcepcion.class)
                .hasMessage("Alcanzaste el límite de 3 noticias por día de tu nivel Básico");
        assertThat(regla.cupo(basico, 3).restantes()).isZero();
        assertThat(regla.cupo(basico, 5).restantes()).isZero();
    }

    @Test
    void losNivelesAltosPublicanMas() {
        Usuario activo = usuario(2L, Usuario.Rol.USUARIO_COMUN, NIVEL_2, 60);
        Usuario corresponsal = usuario(3L, Usuario.Rol.USUARIO_COMUN, NIVEL_3, 200);

        assertThatCode(() -> regla.verificar(activo, 9)).doesNotThrowAnyException();
        assertThatThrownBy(() -> regla.verificar(activo, 10)).isInstanceOf(LimiteDiarioAlcanzadoExcepcion.class);
        assertThatCode(() -> regla.verificar(corresponsal, 29)).doesNotThrowAnyException();
        assertThatThrownBy(() -> regla.verificar(corresponsal, 30)).isInstanceOf(LimiteDiarioAlcanzadoExcepcion.class);
    }

    @Test
    void elAdministradorNoTieneLimiteSiAsiEstaConfigurado() {
        Usuario administrador = usuario(9L, Usuario.Rol.ADMINISTRADOR, NIVEL_1, 0);

        CupoDiario cupo = regla.cupo(administrador, 50);

        assertThat(cupo.ilimitado()).isTrue();
        assertThat(cupo.puedePublicar()).isTrue();
        assertThatCode(() -> regla.verificar(administrador, 50)).doesNotThrowAnyException();
    }

    @Test
    void elAdministradorTieneElLimiteDeSuNivelSiSeDesactivaLaExcepcion() {
        ReglaLimiteDiario estricta = new ReglaLimiteDiario(false);
        Usuario administrador = usuario(9L, Usuario.Rol.ADMINISTRADOR, NIVEL_1, 0);

        assertThatThrownBy(() -> estricta.verificar(administrador, 3))
                .isInstanceOf(LimiteDiarioAlcanzadoExcepcion.class);
    }
}
