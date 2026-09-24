package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.Noticia;
import com.aldia.dominio.modelo.NuevaNoticia;

public interface PublicarNoticiaCasoDeUso {

    Noticia publicar(String correoAutor, NuevaNoticia datos);
}
