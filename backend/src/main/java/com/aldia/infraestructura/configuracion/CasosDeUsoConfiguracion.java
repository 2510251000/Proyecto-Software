package com.aldia.infraestructura.configuracion;

import java.time.Clock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.aldia.aplicacion.servicio.GestionarUsuariosServicio;
import com.aldia.aplicacion.servicio.IniciarSesionServicio;
import com.aldia.aplicacion.servicio.ListarNoticiasServicio;
import com.aldia.aplicacion.servicio.ModerarNoticiaServicio;
import com.aldia.aplicacion.servicio.NotificacionesServicio;
import com.aldia.aplicacion.servicio.ObtenerNoticiaServicio;
import com.aldia.aplicacion.servicio.ObtenerUsuarioActualServicio;
import com.aldia.aplicacion.servicio.PerfilServicio;
import com.aldia.aplicacion.servicio.PublicarNoticiaServicio;
import com.aldia.aplicacion.servicio.RegistrarUsuarioServicio;
import com.aldia.aplicacion.servicio.UbicacionServicio;
import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.ParametrosRecomendacion;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;
import com.aldia.dominio.servicio.CalculadoraNivel;
import com.aldia.dominio.servicio.PoliticaRecomendacion;
import com.aldia.dominio.servicio.ReglaLimiteDiario;

/**
 * Arma los casos de uso y las reglas del dominio con sus adaptadores. Es el único
 * lugar donde la aplicación se conecta con Spring: el dominio y los casos de uso son
 * Java puro y no tienen anotaciones.
 */
@Configuration
public class CasosDeUsoConfiguracion {

    // ---- Reglas del dominio, con los parámetros de application.yml ----

    @Bean
    public ReglaLimiteDiario reglaLimiteDiario(
            @Value("${aldia.noticias.administrador-sin-limite}") boolean administradorSinLimite) {
        return new ReglaLimiteDiario(administradorSinLimite);
    }

    @Bean
    public CalculadoraNivel calculadoraNivel(
            @Value("${aldia.niveles.puntos-por-publicacion}") int puntosPorPublicacion,
            @Value("${aldia.niveles.puntos-penalizacion-moderacion}") int penalizacion) {
        return new CalculadoraNivel(new ParametrosNiveles(puntosPorPublicacion, penalizacion));
    }

    @Bean
    public PoliticaRecomendacion politicaRecomendacion(
            @Value("${aldia.recomendacion.horas-ventaja-por-nivel}") int horasPorNivel,
            @Value("${aldia.recomendacion.horas-ventaja-oficial}") int horasOficial) {
        return new PoliticaRecomendacion(new ParametrosRecomendacion(horasPorNivel, horasOficial));
    }

    @Bean
    public AvisosPorCiudad avisosPorCiudad() {
        return new AvisosPorCiudad();
    }

    // ---- Casos de uso ----

    @Bean
    public RegistrarUsuarioServicio registrarUsuarioServicio(UsuarioRepositorioPuerto usuarios,
                                                             NivelRepositorioPuerto niveles,
                                                             CiudadRepositorioPuerto ciudades,
                                                             CifradorPuerto cifrador,
                                                             Clock reloj) {
        return new RegistrarUsuarioServicio(usuarios, niveles, ciudades, cifrador, reloj);
    }

    @Bean
    public IniciarSesionServicio iniciarSesionServicio(UsuarioRepositorioPuerto usuarios, CifradorPuerto cifrador,
                                                       TokenPuerto token) {
        return new IniciarSesionServicio(usuarios, cifrador, token);
    }

    @Bean
    public ObtenerUsuarioActualServicio obtenerUsuarioActualServicio(UsuarioRepositorioPuerto usuarios) {
        return new ObtenerUsuarioActualServicio(usuarios);
    }

    @Bean
    public PerfilServicio perfilServicio(UsuarioRepositorioPuerto usuarios, NivelRepositorioPuerto niveles,
                                         NoticiaRepositorioPuerto noticias, CiudadRepositorioPuerto ciudades,
                                         ReglaLimiteDiario reglaLimiteDiario, CalculadoraNivel calculadoraNivel,
                                         Clock reloj) {
        return new PerfilServicio(usuarios, niveles, noticias, ciudades, reglaLimiteDiario, calculadoraNivel, reloj);
    }

    @Bean
    public ListarNoticiasServicio listarNoticiasServicio(NoticiaRepositorioPuerto noticias,
                                                         PoliticaRecomendacion politicaRecomendacion,
                                                         @Value("${aldia.noticias.maximo-listado}") int maximo) {
        return new ListarNoticiasServicio(noticias, politicaRecomendacion, maximo);
    }

    @Bean
    public ObtenerNoticiaServicio obtenerNoticiaServicio(NoticiaRepositorioPuerto noticias) {
        return new ObtenerNoticiaServicio(noticias);
    }

    @Bean
    public PublicarNoticiaServicio publicarNoticiaServicio(UsuarioRepositorioPuerto usuarios,
                                                           CiudadRepositorioPuerto ciudades,
                                                           NoticiaRepositorioPuerto noticias,
                                                           HistorialRepositorioPuerto historial,
                                                           NivelRepositorioPuerto niveles,
                                                           NotificacionRepositorioPuerto notificaciones,
                                                           EjecutorTransaccionalPuerto transaccion,
                                                           ReglaLimiteDiario reglaLimiteDiario,
                                                           CalculadoraNivel calculadoraNivel,
                                                           AvisosPorCiudad avisosPorCiudad,
                                                           Clock reloj) {
        return new PublicarNoticiaServicio(usuarios, ciudades, noticias, historial, niveles, notificaciones,
                transaccion, reglaLimiteDiario, calculadoraNivel, avisosPorCiudad, reloj);
    }

    @Bean
    public NotificacionesServicio notificacionesServicio(UsuarioRepositorioPuerto usuarios,
                                                         NotificacionRepositorioPuerto notificaciones,
                                                         @Value("${aldia.notificaciones.maximo-listado}") int maximo) {
        return new NotificacionesServicio(usuarios, notificaciones, maximo);
    }

    @Bean
    public ModerarNoticiaServicio moderarNoticiaServicio(NoticiaRepositorioPuerto noticias,
                                                         UsuarioRepositorioPuerto usuarios,
                                                         NivelRepositorioPuerto niveles,
                                                         NotificacionRepositorioPuerto notificaciones,
                                                         HistorialRepositorioPuerto historial,
                                                         EjecutorTransaccionalPuerto transaccion,
                                                         CalculadoraNivel calculadoraNivel,
                                                         Clock reloj,
                                                         @Value("${aldia.noticias.maximo-listado}") int maximo) {
        return new ModerarNoticiaServicio(noticias, usuarios, niveles, notificaciones, historial, transaccion,
                calculadoraNivel, reloj, maximo);
    }

    @Bean
    public GestionarUsuariosServicio gestionarUsuariosServicio(UsuarioRepositorioPuerto usuarios,
                                                               NivelRepositorioPuerto niveles,
                                                               NotificacionRepositorioPuerto notificaciones,
                                                               HistorialRepositorioPuerto historial,
                                                               EjecutorTransaccionalPuerto transaccion,
                                                               CalculadoraNivel calculadoraNivel,
                                                               Clock reloj) {
        return new GestionarUsuariosServicio(usuarios, niveles, notificaciones, historial, transaccion,
                calculadoraNivel, reloj);
    }

    @Bean
    public UbicacionServicio ubicacionServicio(GeocodificadorPuerto geocodificador, CiudadRepositorioPuerto ciudades) {
        return new UbicacionServicio(geocodificador, ciudades);
    }
}
