package com.aldia.infraestructura.seguridad;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.aldia.dominio.excepcion.CredencialesInvalidasExcepcion;
import com.aldia.dominio.excepcion.InicioExternoNoDisponibleExcepcion;
import com.aldia.dominio.modelo.IdentidadExterna;
import com.aldia.dominio.puerto.salida.VerificadorIdentidadPuerto;

/**
 * Verifica el token de identidad de Firebase Authentication (inicio con Google) con las llaves
 * públicas de Google: firma, vencimiento, emisor y proyecto. No hace falta ninguna clave secreta
 * ni el SDK de administración de Firebase.
 *
 * Si FIREBASE_PROYECTO está vacío (por ejemplo en local), el inicio con Google queda apagado.
 */
@Component
public class FirebaseVerificadorAdaptador implements VerificadorIdentidadPuerto {

    private static final String EMISOR = "https://securetoken.google.com/";
    private static final String NO_CONFIRMADA = "No pudimos confirmar tu cuenta de Google. Inténtalo de nuevo";

    private final JwtDecoder decodificador;

    @Autowired
    public FirebaseVerificadorAdaptador(
            @Value("${aldia.firebase.proyecto:}") String proyecto,
            @Value("${aldia.firebase.llaves-url}") String urlLlaves) {
        this.decodificador = proyecto.isBlank() ? null : crearDecodificador(proyecto, urlLlaves);
    }

    /** Para las pruebas: un decodificador ya armado. */
    FirebaseVerificadorAdaptador(JwtDecoder decodificador) {
        this.decodificador = decodificador;
    }

    private static JwtDecoder crearDecodificador(String proyecto, String urlLlaves) {
        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(urlLlaves).build();
        OAuth2TokenValidator<Jwt> validadores = new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(EMISOR + proyecto),
                new JwtClaimValidator<List<String>>("aud", audiencia -> audiencia != null && audiencia.contains(proyecto)));
        nimbus.setJwtValidator(validadores);
        return nimbus;
    }

    @Override
    public IdentidadExterna verificar(String token) {
        if (decodificador == null) {
            throw new InicioExternoNoDisponibleExcepcion();
        }
        Jwt jwt;
        try {
            jwt = decodificador.decode(token);
        } catch (JwtException tokenInvalido) {
            throw new CredencialesInvalidasExcepcion(NO_CONFIRMADA);
        }
        String correo = jwt.getClaimAsString("email");
        if (correo == null || correo.isBlank() || !Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))) {
            throw new CredencialesInvalidasExcepcion(NO_CONFIRMADA);
        }
        return new IdentidadExterna(correo, jwt.getClaimAsString("name"));
    }
}
