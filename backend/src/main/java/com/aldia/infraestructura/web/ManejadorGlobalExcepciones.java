package com.aldia.infraestructura.web;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.UsuarioYaExisteExcepcion;
import com.aldia.infraestructura.web.dto.ErrorResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> manejarValidacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Datos inválidos");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO(mensaje));
    }

    @ExceptionHandler(CredencialesInvalidasExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarCredencialesInvalidas(CredencialesInvalidasExcepcion ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(UsuarioYaExisteExcepcion.class)
    public ResponseEntity<ErrorResponseDTO> manejarUsuarioYaExiste(UsuarioYaExisteExcepcion ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> manejarErrorGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Ocurrió un error inesperado"));
    }
}