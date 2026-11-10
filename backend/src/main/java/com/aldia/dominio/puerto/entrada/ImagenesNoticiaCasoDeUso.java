package com.aldia.dominio.puerto.entrada;

import com.aldia.dominio.modelo.ArchivoImagen;

public interface ImagenesNoticiaCasoDeUso {

    /**
     * La foto número {@code orden} de la noticia. Si la noticia no está publicada solo la ven
     * su autor y los administradores; para los demás no existe (404).
     *
     * @param correoSolicitante correo de la sesión, o null si no hay sesión
     */
    ArchivoImagen leer(Long noticiaId, int orden, String correoSolicitante, boolean esAdministrador);
}
