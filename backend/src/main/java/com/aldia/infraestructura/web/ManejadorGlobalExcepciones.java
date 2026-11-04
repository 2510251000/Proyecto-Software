package com.aldia.infraestructura.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.beans.factory.annotation.Value;

import com.aldia.dominio.excepcion.AccionNoPermitidaExcepcion;
import com.aldia.dominio.excepcion.CiudadNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.ComentarioNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.DatosInvalidosExcepcion;
import com.aldia.dominio.excepcion.ReporteDuplicadoExcepcion;
import com.aldia.dominio.excepcion.ReporteNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.ImagenNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.NotificacionNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.ServicioUbicacionNoDisponibleExcepcion;
import com.aldia.dominio.excepcion.UbicacionNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.CuentaDesactivadaExcepcion;
import com.aldia.dominio.excepcion.LimiteDiarioAlcanzadoExcepcion;
import com.aldia.dominio.excepcion.NoticiaNoEncontradaExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.infraestructura.web.dto.ErrorResponseDTO;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    private static final Logger LOG = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

    private final int tamanoMaximoMb;

    public ManejadorGlobalExcepciones(@Value("${aldia.imagenes.tamano-maximo-mb}") int tamanoMaximoMb) {
        this.tamanoMaximoMb = tamanoMaximoMb;
    }

    /** Una foto (o la petición completa) pasó del límite de spring.servlet.multipart. */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> manejarArchivoMuyGrande(MaxUploadSizeExceededException ex) {
        return responder(HttpStatus.PAYLOAD_TOO_LARGE,
                "Las fotos son muy pesadas: cada una puede pesar máximo " + tamanoMaximoMb + " MB");
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponseDTO> manejarParteFaltante(MissingServletRequestPartException ex) {
        return responder(HttpStatus.BAD_REQUEST, "Falta la parte '" + ex.getRequestPartName() + "' de la petición");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> manejarValidacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Datos inválidos");

        return responder(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDTO> manejarCuerpoInvalido(HttpMessageNotReadableException ex) {
        return responder(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es un JSON válido");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> manejarParametroInvalido(MethodArgumentTypeMismatchException ex) {
        return responder(HttpStatus.BAD_REQUEST, "El parámetro '" + ex.getName() + "' no tiene un valor válido");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDTO> manejarParametroFaltante(MissingServletRequestParameterException ex) {
        return responder(HttpStatus.BAD_REQUEST, "Falta el parámetro '" + ex.getParameterName() + "'");
    }

    @ExceptionHandler(DatosInvalidosExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarDatosInvalidos(DatosInvalidosExcepcion ex) {
        return responder(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(AccionNoPermitidaExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarAccionNoPermitida(AccionNoPermitidaExcepcion ex) {
        return responder(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler({UbicacionNoEncontradaExcepcion.class, NotificacionNoEncontradaExcepcion.class,
            ImagenNoEncontradaExcepcion.class, ComentarioNoEncontradoExcepcion.class,
            ReporteNoEncontradoExcepcion.class})
    public ResponseEntity<ErrorResponseDTO> manejarNoEncontrado(RuntimeException ex) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ServicioUbicacionNoDisponibleExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarUbicacionNoDisponible(ServicioUbicacionNoDisponibleExcepcion ex) {
        return responder(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    @ExceptionHandler(CiudadNoEncontradaExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarCiudadNoEncontrada(CiudadNoEncontradaExcepcion ex) {
        return responder(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NoticiaNoEncontradaExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarNoticiaNoEncontrada(NoticiaNoEncontradaExcepcion ex) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(LimiteDiarioAlcanzadoExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarLimiteDiario(LimiteDiarioAlcanzadoExcepcion ex) {
        return responder(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
    }

    @ExceptionHandler(CredencialesInvalidasExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarCredencialesInvalidas(CredencialesInvalidasExcepcion ex) {
        return responder(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(CuentaDesactivadaExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarCuentaDesactivada(CuentaDesactivadaExcepcion ex) {
        return responder(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(UsuarioNoEncontradoExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarUsuarioNoEncontrado(UsuarioNoEncontradoExcepcion ex) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ReporteDuplicadoExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarReporteDuplicado(ReporteDuplicadoExcepcion ex) {
        return responder(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UsuarioYaExisteExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarUsuarioYaExiste(UsuarioYaExisteExcepcion ex) {
        return responder(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponseDTO> manejarRutaInexistente(NoResourceFoundException ex) {
        return responder(HttpStatus.NOT_FOUND, "La ruta solicitada no existe");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> manejarErrorGeneral(Exception ex) {
        // Se registra el detalle en la consola del servidor; al cliente solo le llega un mensaje genérico.
        LOG.error("Error no controlado", ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado");
    }

    private ResponseEntity<ErrorResponseDTO> responder(HttpStatus estado, String mensaje) {
        return ResponseEntity.status(estado).body(new ErrorResponseDTO(estado.value(), mensaje));
    }
}
