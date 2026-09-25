-- ============================================================================
--  Al Día: Portal de Noticias
--  03-datos-prueba.sql — datos de ejemplo para probar la aplicación
--
--  Uso:  psql -U postgres -d aldia_db -f 03-datos-prueba.sql
--  Se ejecuta DESPUÉS de 01-schema.sql y 02-datos-iniciales.sql.
--
--  ADVERTENCIA: son datos de prueba, solo para uso local. Nunca se ejecuta
--  este script en los ambientes de test ni de producción.
--
--  Cuentas que crea (la contraseña se guarda cifrada con BCrypt):
--    admin@aldia.com         / Admin12345     (ADMINISTRADOR)
--    corresponsal@aldia.com  / Usuario12345   (USUARIO_COMUN)
-- ============================================================================

-- En Windows psql usa la codificación de la consola (WIN1252) y daña las tildes.
SET client_encoding = 'UTF8';

-- ---------------------------------------------------------------------------
--  Limpieza previa
--  Borra lo que haya dejado una corrida anterior de este mismo script, para
--  poder ejecutarlo las veces que haga falta sin duplicar noticias. Solo toca
--  las dos cuentas de prueba; el resto de los datos queda intacto.
-- ---------------------------------------------------------------------------
DELETE FROM noticia
 WHERE usuario_id IN (SELECT id FROM usuario
                       WHERE correo IN ('admin@aldia.com', 'corresponsal@aldia.com'));

DELETE FROM usuario
 WHERE correo IN ('admin@aldia.com', 'corresponsal@aldia.com');

-- ---------------------------------------------------------------------------
--  Usuarios
--  El hash corresponde a las contraseñas indicadas arriba.
-- ---------------------------------------------------------------------------
INSERT INTO usuario (correo, contrasena_cifrada, nombre, rol, puntaje, ciudad_id, nivel_id)
VALUES (
    'admin@aldia.com',
    '$2a$10$I8tRdcDuR6qpisZFIOKCqehn9zMqH0jDyI.OURX5qFoYMr5DWZLee',
    'Administrador del portal',
    'ADMINISTRADOR',
    0,
    (SELECT id FROM ciudad WHERE nombre = 'Fusagasugá'),
    (SELECT id FROM nivel WHERE puntaje_minimo = 0)
)
ON CONFLICT (correo) DO NOTHING;

INSERT INTO usuario (correo, contrasena_cifrada, nombre, rol, puntaje, ciudad_id, nivel_id)
VALUES (
    'corresponsal@aldia.com',
    '$2a$10$4ybrXfdwdQn2/fPIci1P9.A39myqPfgQx0rfcPneGW8qrE.hFWRfC',
    'María Corresponsal',
    'USUARIO_COMUN',
    160,
    (SELECT id FROM ciudad WHERE nombre = 'Soacha'),
    (SELECT id FROM nivel WHERE nombre = 'Corresponsal Certificado')
)
ON CONFLICT (correo) DO NOTHING;

-- ---------------------------------------------------------------------------
--  Noticias
--  Cinco publicadas (tres oficiales y dos comunitarias) y una oculta, para
--  comprobar que el listado solo muestra las que están en estado PUBLICADA.
-- ---------------------------------------------------------------------------
INSERT INTO noticia (titulo, resumen, contenido, fecha_publicacion, oficial, estado,
                     latitud, longitud, usuario_id, ciudad_id)
VALUES
(
    'Fusagasugá inaugura la nueva ciclorruta del centro',
    'La obra conecta el parque principal con la terminal y beneficia a más de veinte mil ciclistas.',
    'La administración municipal entregó este viernes los 4,2 kilómetros de ciclorruta que unen el parque principal con la terminal de transportes. La vía cuenta con señalización, iluminación y dos puntos de reparación gratuitos. Según la Secretaría de Movilidad, la obra beneficia a más de veinte mil personas que usan la bicicleta a diario.',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    TRUE, 'PUBLICADA', 4.33722000, -74.36389000,
    (SELECT id FROM usuario WHERE correo = 'admin@aldia.com'),
    (SELECT id FROM ciudad WHERE nombre = 'Fusagasugá')
),
(
    'Cortes de agua programados para este jueves',
    'La empresa de acueducto anunció mantenimiento en los barrios del sur entre las 8 a. m. y las 4 p. m.',
    'La empresa de acueducto informó que el próximo jueves suspenderá el servicio en catorce barrios del sur del municipio, entre las 8 de la mañana y las 4 de la tarde, por labores de mantenimiento en la red principal. Se recomienda almacenar agua con anticipación.',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    TRUE, 'PUBLICADA', 4.57937000, -74.21682000,
    (SELECT id FROM usuario WHERE correo = 'admin@aldia.com'),
    (SELECT id FROM ciudad WHERE nombre = 'Soacha')
),
(
    'Abren las inscripciones para las escuelas deportivas',
    'Los cupos son gratuitos y están dirigidos a niños y jóvenes entre 6 y 17 años.',
    'El Instituto Municipal de Deporte abrió las inscripciones para las escuelas de formación en fútbol, baloncesto, natación y atletismo. Los cupos son gratuitos, están dirigidos a niños y jóvenes entre 6 y 17 años, y las clases comienzan la primera semana del próximo mes.',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    TRUE, 'PUBLICADA', 5.02204000, -73.99578000,
    (SELECT id FROM usuario WHERE correo = 'admin@aldia.com'),
    (SELECT id FROM ciudad WHERE nombre = 'Zipaquirá')
),
(
    'Vecinos de La Esperanza reparan el parque por su cuenta',
    'Veinte familias se organizaron para pintar los juegos y arreglar la cancha del barrio.',
    'Durante el fin de semana, veinte familias del barrio La Esperanza se reunieron para pintar los juegos infantiles, reparar las mallas de la cancha y sembrar árboles en el parque. La jornada se organizó por un grupo de WhatsApp del barrio y los materiales se reunieron entre los vecinos.',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    FALSE, 'PUBLICADA', 4.57937000, -74.21682000,
    (SELECT id FROM usuario WHERE correo = 'corresponsal@aldia.com'),
    (SELECT id FROM ciudad WHERE nombre = 'Soacha')
),
(
    'La feria gastronómica reunirá a cuarenta emprendedores',
    'El evento será este fin de semana en la plaza de mercado, con entrada libre.',
    'Cuarenta emprendedores de la región participarán en la feria gastronómica que se realizará el sábado y el domingo en la plaza de mercado. Habrá muestras de cocina tradicional, café de la zona y actividades para niños. La entrada es libre.',
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    FALSE, 'PUBLICADA', 4.86311000, -74.35540000,
    (SELECT id FROM usuario WHERE correo = 'corresponsal@aldia.com'),
    (SELECT id FROM ciudad WHERE nombre = 'Facatativá')
),
(
    'Publicación retirada por moderación',
    'Esta noticia está oculta y no debe aparecer en el listado.',
    'Contenido retirado por el administrador. Sirve para comprobar que el listado solo muestra las noticias en estado PUBLICADA.',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    FALSE, 'OCULTA', NULL, NULL,
    (SELECT id FROM usuario WHERE correo = 'corresponsal@aldia.com'),
    (SELECT id FROM ciudad WHERE nombre = 'Chía')
);

-- ---------------------------------------------------------------------------
--  Interacción sobre la primera noticia: comentarios y calificaciones
-- ---------------------------------------------------------------------------
INSERT INTO comentario (contenido, usuario_id, noticia_id)
VALUES
(
    'Excelente noticia, la ciclorruta hacía mucha falta en ese tramo.',
    (SELECT id FROM usuario WHERE correo = 'corresponsal@aldia.com'),
    (SELECT id FROM noticia WHERE titulo = 'Fusagasugá inaugura la nueva ciclorruta del centro')
),
(
    'Ojalá le hagan mantenimiento a la señalización cada semestre.',
    (SELECT id FROM usuario WHERE correo = 'admin@aldia.com'),
    (SELECT id FROM noticia WHERE titulo = 'Fusagasugá inaugura la nueva ciclorruta del centro')
);

INSERT INTO calificacion (valor, usuario_id, noticia_id)
VALUES
(
    5,
    (SELECT id FROM usuario WHERE correo = 'corresponsal@aldia.com'),
    (SELECT id FROM noticia WHERE titulo = 'Fusagasugá inaugura la nueva ciclorruta del centro')
),
(
    4,
    (SELECT id FROM usuario WHERE correo = 'admin@aldia.com'),
    (SELECT id FROM noticia WHERE titulo = 'Vecinos de La Esperanza reparan el parque por su cuenta')
)
ON CONFLICT (usuario_id, noticia_id) DO NOTHING;

-- ---------------------------------------------------------------------------
--  Notificación por cercanía de ejemplo
-- ---------------------------------------------------------------------------
INSERT INTO notificacion (mensaje, tipo, usuario_id, noticia_id)
VALUES (
    'Se publicó una noticia nueva en tu ciudad: cortes de agua programados para este jueves.',
    'CERCANIA',
    (SELECT id FROM usuario WHERE correo = 'corresponsal@aldia.com'),
    (SELECT id FROM noticia WHERE titulo = 'Cortes de agua programados para este jueves')
);

-- ---------------------------------------------------------------------------
--  Resumen de lo insertado
-- ---------------------------------------------------------------------------
SELECT 'usuarios' AS tabla, COUNT(*) AS filas FROM usuario
UNION ALL SELECT 'noticias publicadas', COUNT(*) FROM noticia WHERE estado = 'PUBLICADA'
UNION ALL SELECT 'noticias ocultas',    COUNT(*) FROM noticia WHERE estado = 'OCULTA'
UNION ALL SELECT 'comentarios',         COUNT(*) FROM comentario
UNION ALL SELECT 'calificaciones',      COUNT(*) FROM calificacion
UNION ALL SELECT 'notificaciones',      COUNT(*) FROM notificacion;
