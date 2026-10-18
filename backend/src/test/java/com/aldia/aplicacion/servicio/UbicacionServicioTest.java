package com.aldia.aplicacion.servicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.excepcion.UbicacionNoEncontradaExcepcion;
import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.UbicacionEncontrada;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;

@ExtendWith(MockitoExtension.class)
class UbicacionServicioTest {

    private static final BigDecimal LAT = new BigDecimal("4.33720000");
    private static final BigDecimal LNG = new BigDecimal("-74.36390000");
    private static final UbicacionEncontrada FUSA = new UbicacionEncontrada("osm:R1414846", "Fusagasugá",
            "Cundinamarca", "Fusagasugá, Sumapaz, Cundinamarca, Colombia", LAT, LNG, "nominatim");
    private static final Ciudad FUSA_CATALOGO = new Ciudad(1L, "Fusagasugá", "Cundinamarca", null, null, null);

    @Mock
    private GeocodificadorPuerto geocodificador;
    @Mock
    private CiudadRepositorioPuerto ciudades;

    private UbicacionServicio servicio;

    @BeforeEach
    void preparar() {
        servicio = new UbicacionServicio(geocodificador, ciudades);
    }

    @Test
    void conLasCoordenadasReutilizaLaCiudadQueYaEstabaEnElCatalogo() {
        when(geocodificador.enCoordenadas(LAT, LNG)).thenReturn(Optional.of(FUSA));
        when(ciudades.buscarPorIdLugar("osm:R1414846")).thenReturn(Optional.empty());
        when(ciudades.buscarPorNombreYDepartamento("Fusagasugá", "Cundinamarca")).thenReturn(Optional.of(FUSA_CATALOGO));

        assertThat(servicio.resolverCoordenadas(LAT, LNG)).isEqualTo(FUSA_CATALOGO);
        verify(ciudades, never()).guardar(any());
    }

    @Test
    void unaCiudadNuevaQuedaEnElCatalogoConSuIdDeLugar() {
        UbicacionEncontrada tocaima = new UbicacionEncontrada("osm:R1", "Tocaima", "Cundinamarca", "Tocaima",
                LAT, LNG, "nominatim");
        when(geocodificador.porIdLugar("osm:R1")).thenReturn(Optional.of(tocaima));
        when(ciudades.buscarPorIdLugar("osm:R1")).thenReturn(Optional.empty());
        when(ciudades.buscarPorNombreYDepartamento("Tocaima", "Cundinamarca")).thenReturn(Optional.empty());
        when(ciudades.guardar(any(Ciudad.class))).thenAnswer(inv -> {
            Ciudad c = inv.getArgument(0);
            return new Ciudad(99L, c.nombre(), c.departamento(), c.latitud(), c.longitud(), c.idLugar());
        });

        Ciudad resultado = servicio.resolverLugar("osm:R1");

        assertThat(resultado.id()).isEqualTo(99L);
        assertThat(resultado.idLugar()).isEqualTo("osm:R1");
    }

    @Test
    void siLaApiNoEncuentraMunicipioResponde404() {
        when(geocodificador.enCoordenadas(LAT, LNG)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.resolverCoordenadas(LAT, LNG))
                .isInstanceOf(UbicacionNoEncontradaExcepcion.class);
    }

    @Test
    void laBusquedaPideAlMenosTresLetrasSinLlamarALaApi() {
        assertThatThrownBy(() -> servicio.buscar("fu")).isInstanceOf(DatosInvalidosExcepcion.class);
        verify(geocodificador, never()).buscar(any());
    }
}
