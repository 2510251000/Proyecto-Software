package com.aldia.infraestructura.configuracion;

import java.time.Clock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.aldia.aplicacion.servicio.ArchivosDeImagenes;
import com.aldia.aplicacion.servicio.CalificarNoticiaServicio;
import com.aldia.aplicacion.servicio.ComentariosServicio;
import com.aldia.aplicacion.servicio.ReportesServicio;
import com.aldia.aplicacion.servicio.GestionarUsuariosServicio;
import com.aldia.aplicacion.servicio.ImagenesNoticiaServicio;
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
import com.aldia.dominio.modelo.ParametrosImagenes;
import com.aldia.dominio.modelo.ParametrosInteraccion;
import com.aldia.dominio.modelo.ParametrosNiveles;
import com.aldia.dominio.modelo.ParametrosRecomendacion;
import com.aldia.dominio.puerto.salida.AlmacenImagenesPuerto;
import com.aldia.dominio.puerto.salida.CalificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.CifradorPuerto;
import com.aldia.dominio.puerto.salida.CiudadRepositorioPuerto;
import com.aldia.dominio.puerto.salida.ComentarioRepositorioPuerto;
import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;
import com.aldia.dominio.puerto.salida.HistorialRepositorioPuerto;
import com.aldia.dominio.puerto.salida.ImagenRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NivelRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NoticiaRepositorioPuerto;
import com.aldia.dominio.puerto.salida.NotificacionRepositorioPuerto;
import com.aldia.dominio.puerto.salida.ProcesadorImagenesPuerto;
import com.aldia.dominio.puerto.salida.ReporteRepositorioPuerto;
import com.aldia.dominio.puerto.salida.TokenPuerto;
import com.aldia.dominio.puerto.salida.UsuarioRepositorioPuerto;
import com.aldia.dominio.servicio.AvisosPorCiudad;
import com.aldia.dominio.servicio.CalculadoraNivel;
import com.aldia.dominio.servicio.PoliticaRecomendacion;
import com.aldia.dominio.servicio.ReglaLimiteDiario;
import com.aldia.dominio.servicio.ReglasInteraccion;
import com.aldia.dominio.servicio.ValidadorImagenes;

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

    private static final long BYTES_POR_MB = 1024L * 1024L;

    @Bean
    public ValidadorImagenes validadorImagenes(
            @Value("${aldia.imagenes.maximo-por-noticia}") int maximo,
            @Value("${aldia.imagenes.tamano-maximo-mb}") int megas,
            @Value("${aldia.imagenes.ancho-maximo}") int ancho,
            @Value("${aldia.imagenes.alto-maximo}") int alto,
            @Value("${aldia.imagenes.largo-maximo-descripcion}") int largoDescripcion) {
        return new ValidadorImagenes(new ParametrosImagenes(maximo, megas * BYTES_POR_MB, ancho, alto, largoDescripcion));
    }

    @Bean
    public ArchivosDeImagenes archivosDeImagenes(ValidadorImagenes validador, ProcesadorImagenesPuerto procesador,
                                                 AlmacenImagenesPuerto almacen) {
        return new ArchivosDeImagenes(validador, procesador, almacen);
    }

    // ---- Casos de uso ----

    @Bean
    public RegistrarUsuarioServicio registrarUsuarioServicio(UsuarioRepositorioPuerto usuarios,
                                                             NivelRepositorioPuerto niveles,
                                                             CiudadRepositorioPuerto ciudades,
                                                             CifradorPuerto cifrador,
                                                             Clock reloj,
                                                             HistorialRepositorioPuerto historial) {
        return new RegistrarUsuarioServicio(usuarios, niveles, ciudades, cifrador, reloj, historial);
    }

    @Bean
    public IniciarSesionServicio iniciarSesionServicio(UsuarioRepositorioPuerto usuarios, CifradorPuerto cifrador,
                                                       TokenPuerto token, HistorialRepositorioPuerto historial,
                                                       Clock reloj) {
        return new IniciarSesionServicio(usuarios, cifrador, token, historial, reloj);
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
                                                           Clock reloj,
                                                           ArchivosDeImagenes archivosDeImagenes,
                                                           ImagenRepositorioPuerto imagenes) {
        return new PublicarNoticiaServicio(usuarios, ciudades, noticias, historial, niveles, notificaciones,
                transaccion, reglaLimiteDiario, calculadoraNivel, avisosPorCiudad, reloj, archivosDeImagenes, imagenes);
    }

    @Bean
    public ImagenesNoticiaServicio imagenesNoticiaServicio(NoticiaRepositorioPuerto noticias,
                                                           ImagenRepositorioPuerto imagenes,
                                                           UsuarioRepositorioPuerto usuarios,
                                                           AlmacenImagenesPuerto almacen) {
        return new ImagenesNoticiaServicio(noticias, imagenes, usuarios, almacen);
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
    public ReglasInteraccion reglasInteraccion(
            @Value("${aldia.interaccion.largo-maximo-comentario}") int largoComentario,
            @Value("${aldia.interaccion.largo-maximo-descripcion-reporte}") int largoReporte,
            @Value("${aldia.interaccion.maximo-comentarios-listado}") int maximoComentarios,
            @Value("${aldia.interaccion.maximo-reportes-listado}") int maximoReportes) {
        return new ReglasInteraccion(new ParametrosInteraccion(largoComentario, largoReporte, maximoComentarios,
                maximoReportes));
    }

    @Bean
    public ComentariosServicio comentariosServicio(ComentarioRepositorioPuerto comentarios,
                                                   NoticiaRepositorioPuerto noticias,
                                                   UsuarioRepositorioPuerto usuarios,
                                                   NotificacionRepositorioPuerto notificaciones,
                                                   HistorialRepositorioPuerto historial,
                                                   EjecutorTransaccionalPuerto transaccion,
                                                   ReglasInteraccion reglas,
                                                   Clock reloj) {
        return new ComentariosServicio(comentarios, noticias, usuarios, notificaciones, historial, transaccion,
                reglas, reloj);
    }

    @Bean
    public CalificarNoticiaServicio calificarNoticiaServicio(CalificacionRepositorioPuerto calificaciones,
                                                             NoticiaRepositorioPuerto noticias,
                                                             UsuarioRepositorioPuerto usuarios,
                                                             NotificacionRepositorioPuerto notificaciones,
                                                             HistorialRepositorioPuerto historial,
                                                             EjecutorTransaccionalPuerto transaccion,
                                                             ReglasInteraccion reglas,
                                                             Clock reloj) {
        return new CalificarNoticiaServicio(calificaciones, noticias, usuarios, notificaciones, historial,
                transaccion, reglas, reloj);
    }

    @Bean
    public ReportesServicio reportesServicio(ReporteRepositorioPuerto reportes,
                                             NoticiaRepositorioPuerto noticias,
                                             UsuarioRepositorioPuerto usuarios,
                                             HistorialRepositorioPuerto historial,
                                             EjecutorTransaccionalPuerto transaccion,
                                             ReglasInteraccion reglas,
                                             Clock reloj) {
        return new ReportesServicio(reportes, noticias, usuarios, historial, transaccion, reglas, reloj);
    }

    @Bean
    public UbicacionServicio ubicacionServicio(GeocodificadorPuerto geocodificador, CiudadRepositorioPuerto ciudades) {
        return new UbicacionServicio(geocodificador, ciudades);
    }
}
