package com.aldia.dominio.puerto.salida;

public interface CifradorPuerto {

    String cifrar(String textoPlano);

    boolean coincide(String textoPlano, String textoCifrado);
}