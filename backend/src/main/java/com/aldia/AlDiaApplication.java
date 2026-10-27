package com.aldia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// Se excluye UserDetailsServiceAutoConfiguration porque la autenticación es con JWT propio;
// así Spring no crea un usuario en memoria ni imprime una contraseña generada al arrancar.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class AlDiaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlDiaApplication.class, args);
    }
}
