-- ============================================================================
--  Al Día: Portal de Noticias
--  02-datos-iniciales.sql — datos de los catálogos (nivel y ciudad)
--
--  Uso:  psql -U postgres -d aldia_db -f 02-datos-iniciales.sql
--  Se ejecuta DESPUÉS de 01-schema.sql.
-- ============================================================================

-- En Windows psql usa la codificación de la consola (WIN1252) y daña las tildes.
SET client_encoding = 'UTF8';

-- ---------------------------------------------------------------------------
--  nivel
--
--  IMPORTANTE: 'Básico' debe insertarse PRIMERO. Como nivel.id es BIGSERIAL,
--  la primera fila recibe el id 1, y usuario.nivel_id tiene DEFAULT 1 en
--  01-schema.sql (el backend también registra con el nivel 1): todo usuario
--  nuevo queda en Básico gracias a eso. Si se
--  cambia el orden de estos INSERT, los usuarios nuevos quedarían en otro nivel.
-- ---------------------------------------------------------------------------
INSERT INTO nivel (nombre, puntaje_minimo, limite_noticias_diarias) VALUES
    ('Básico',                    0,  3);
INSERT INTO nivel (nombre, puntaje_minimo, limite_noticias_diarias) VALUES
    ('Activo',                   50, 10);
INSERT INTO nivel (nombre, puntaje_minimo, limite_noticias_diarias) VALUES
    ('Corresponsal Certificado', 150, 30);

-- ---------------------------------------------------------------------------
--  ciudad
--  Lista inicial de ejemplo (municipios de Cundinamarca). Se amplía agregando
--  filas aquí; nunca se escriben ciudades en el código de la aplicación.
-- ---------------------------------------------------------------------------
INSERT INTO ciudad (nombre, departamento) VALUES
    ('Fusagasugá', 'Cundinamarca'),
    ('Soacha',     'Cundinamarca'),
    ('Zipaquirá',  'Cundinamarca'),
    ('Girardot',   'Cundinamarca'),
    ('Facatativá', 'Cundinamarca'),
    ('Chía',       'Cundinamarca');
