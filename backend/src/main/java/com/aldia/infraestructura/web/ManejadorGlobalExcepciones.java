package com.aldia.infraestructura.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.UsuarioNoEncontradoExcepcion;
import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.infraestructura.web.dto.ErrorResponseDTO;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    private static final Logger LOG = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

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

    @ExceptionHandler(CredencialesInvalidasExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarCredencialesInvalidas(CredencialesInvalidasExcepcion ex) {
        return responder(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(UsuarioNoEncontradoExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarUsuarioNoEncontrado(UsuarioNoEncontradoExcepcion ex) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage());
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
