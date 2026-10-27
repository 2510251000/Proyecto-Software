package com.aldia.dominio.servicio;

import static com.aldia.dominio.Fixtures.NIVELES;
import static com.aldia.dominio.Fixtures.NIVEL_1;
import static com.aldia.dominio.Fixtures.NIVEL_2;
import static com.aldia.dominio.Fixtures.NIVEL_3;
import static com.aldia.dominio.Fixtures.usuario;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.Usuario;

class CalculadoraNivelTest {

    private final CalculadoraNivel calculadora = new CalculadoraNivel(new ParametrosNiveles(10, 20));

    @ParameterizedTest
    @CsvSource({"0,1", "49,1", "50,2", "149,2", "150,3", "1000,3"})
    void elNivelEsElMasAltoCuyoPuntajeMinimoSeAlcanza(int puntaje, int nivelEsperado) {
        assertThat(calculadora.nivelPara(puntaje, NIVELES).getNumero()).isEqualTo(nivelEsperado);
    }

    @Test
    void cadaPublicacionSumaPuntosYAlLlegarAlMinimoSubeDeNivel() {
        Usuario antes = usuario(1L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 40);

        Usuario despues = calculadora.sumarPublicacion(antes, NIVELES);

        assertThat(despues.getPuntaje()).isEqualTo(50);
        assertThat(despues.getNivel()).isEqualTo(NIVEL_2);
        assertThat(CalculadoraNivel.subio(antes, despues)).isTrue();
    }

    @Test
    void sinLlegarAlMinimoNoSube() {
        Usuario antes = usuario(1L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 20);

        Usuario despues = calculadora.sumarPublicacion(antes, NIVELES);

        assertThat(despues.getPuntaje()).isEqualTo(30);
        assertThat(CalculadoraNivel.subio(antes, despues)).isFalse();
    }

    @Test
    void laModeracionRestaPuntosPuedeBajarDeNivelYNuncaQuedaNegativo() {
        Usuario activo = usuario(1L, Usuario.Rol.USUARIO_COMUN, NIVEL_2, 55);
        Usuario nuevo = usuario(2L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 5);

        assertThat(calculadora.restarModeracion(activo, NIVELES).getNivel()).isEqualTo(NIVEL_1);
        assertThat(calculadora.restarModeracion(activo, NIVELES).getPuntaje()).isEqualTo(35);
        assertThat(calculadora.restarModeracion(nuevo, NIVELES).getPuntaje()).isZero();
    }

    @Test
    void devolverLaModeracionRecuperaLosPuntos() {
        Usuario usuario = usuario(1L, Usuario.Rol.USUARIO_COMUN, NIVEL_1, 35);

        assertThat(calculadora.devolverModeracion(usuario, NIVELES).getPuntaje()).isEqualTo(55);
        assertThat(calculadora.devolverModeracion(usuario, NIVELES).getNivel()).isEqualTo(NIVEL_2);
    }

    @Test
    void elSiguienteNivelDelUltimoNoExiste() {
        assertThat(calculadora.siguiente(NIVEL_1, NIVELES)).contains(NIVEL_2);
        assertThat(calculadora.siguiente(NIVEL_2, NIVELES)).contains(NIVEL_3);
        assertThat(calculadora.siguiente(NIVEL_3, NIVELES)).isEmpty();
    }
}
