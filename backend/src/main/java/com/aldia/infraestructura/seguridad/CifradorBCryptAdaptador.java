package com.aldia.infraestructura.seguridad;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.aldia.dominio.puerto.salida.CifradorPuerto;

@Component
public class CifradorBCryptAdaptador implements CifradorPuerto {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public String cifrar(String textoPlano) {
        return encoder.encode(textoPlano);
    }

    @Override
    public boolean coincide(String textoPlano, String textoCifrado) {
        return encoder.matches(textoPlano, textoCifrado);
    }
}