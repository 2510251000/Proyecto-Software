# Backend — Al Día: Portal de Noticias

API REST construida con Spring Boot 3.3.4, Java 17 y arquitectura hexagonal.

## Requisitos previos

- Java 17 o superior
- PostgreSQL 17 corriendo localmente
- No es necesario tener Maven instalado, el proyecto incluye su propio wrapper (mvnw)

## Configuración

1. Crea la base de datos (desde la carpeta database/ del repositorio):

psql -U postgres -c "CREATE DATABASE aldia_db;"
psql -U postgres -d aldia_db -f 01-schema.sql
psql -U postgres -d aldia_db -f 02-datos-iniciales.sql

2. Copia .env.example a .env y completa los valores reales:

DB_USUARIO=postgres
DB_CONTRASENA=tu_contraseña
JWT_CLAVE_SECRETA=una_clave_de_al_menos_64_caracteres

## Cómo correr el proyecto

Desde la carpeta backend/:

En Windows (PowerShell o cmd):
.\mvnw.cmd spring-boot:run

La API queda disponible en http://localhost:8080

## Endpoints disponibles

| Endpoint | Método | Descripción |
|---|---|---|
| /api/auth/registro | POST | Registra un nuevo usuario |
| /api/auth/login | POST | Inicia sesión y devuelve un token JWT |
| /api/noticias | GET | Lista las noticias publicadas |
| /api/usuarios/me | GET | Devuelve los datos del usuario autenticado (requiere token) |