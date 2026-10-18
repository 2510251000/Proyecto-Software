package com.aldia.aplicacion.servicio;

import java.math.BigDecimal;
import java.util.List;

import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.excepcion.UbicacionNoEncontradaExcepcion;
import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.UbicacionEncontrada;
import com.aldia.dominio.puerto.entrada.UbicacionCasoDeUso;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;

/**
 * Obtiene la ciudad con la API externa de geocodificación y la deja en el catálogo.
 * Si la ciudad ya estaba (mismo id de lugar o mismo nombre y departamento) se reutiliza.
 */
public class UbicacionServicio implements UbicacionCasoDeUso {

    private static final int LARGO_MINIMO_BUSQUEDA = 3;

    private final GeocodificadorPuerto geocodificador;
    private final CiudadRepositorioPuerto ciudadRepositorioPuerto;

    public UbicacionServicio(GeocodificadorPuerto geocodificador, CiudadRepositorioPuerto ciudadRepositorioPuerto) {
        this.geocodificador = geocodificador;
        this.ciudadRepositorioPuerto = ciudadRepositorioPuerto;
    }

    @Override
    public List<Ciudad> listarCiudades() {
        return ciudadRepositorioPuerto.listarTodas();
    }

    @Override
    public List<UbicacionEncontrada> buscar(String texto) {
        if (texto == null || texto.trim().length() < LARGO_MINIMO_BUSQUEDA) {
            throw new DatosInvalidosExcepcion("Escribe al menos " + LARGO_MINIMO_BUSQUEDA + " letras del municipio");
        }
        return geocodificador.buscar(texto.trim());
    }

    @Override
    public Ciudad resolverCoordenadas(BigDecimal latitud, BigDecimal longitud) {
        return registrar(geocodificador.enCoordenadas(latitud, longitud)
                .orElseThrow(UbicacionNoEncontradaExcepcion::new));
    }

    @Override
    public Ciudad resolverLugar(String idLugar) {
        if (idLugar == null || idLugar.isBlank()) {
            throw new DatosInvalidosExcepcion("Falta el lugar elegido");
        }
        return ciudadRepositorioPuerto.buscarPorIdLugar(idLugar)
                .orElseGet(() -> registrar(geocodificador.porIdLugar(idLugar)
                        .orElseThrow(UbicacionNoEncontradaExcepcion::new)));
    }

    @Override
    public String proveedor() {
        return geocodificador.proveedor();
    }

    private Ciudad registrar(UbicacionEncontrada ubicacion) {
        if (ubicacion.ciudad() == null || ubicacion.departamento() == null) {
            throw new UbicacionNoEncontradaExcepcion();
        }
        if (ubicacion.idLugar() != null) {
            var porLugar = ciudadRepositorioPuerto.buscarPorIdLugar(ubicacion.idLugar());
            if (porLugar.isPresent()) {
                return porLugar.get();
            }
        }
        return ciudadRepositorioPuerto.buscarPorNombreYDepartamento(ubicacion.ciudad(), ubicacion.departamento())
                .orElseGet(() -> ciudadRepositorioPuerto.guardar(new Ciudad(null, ubicacion.ciudad(),
                        ubicacion.departamento(), ubicacion.latitud(), ubicacion.longitud(), ubicacion.idLugar())));
    }
}
