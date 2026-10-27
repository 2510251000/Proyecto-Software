package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.Perfil;

public interface ConsultarPerfilCasoDeUso {

    Perfil consultar(String correo);
}
