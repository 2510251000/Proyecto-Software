-- ============================================================================
--  Al Día: Portal de Noticias
--  Datos de demostración (migración repetible de Flyway)
--
--  Antes era database/03-datos-prueba.sql. Solo se carga cuando la carpeta
--  db/demo está en FLYWAY_UBICACIONES (así viene en el perfil dev; en test y
--  prod no). Se puede correr muchas veces: no duplica nada ni borra lo que
--  los usuarios hayan creado.
--
--  Cuentas (SOLO DEMO; la contraseña se guarda cifrada con BCrypt):
--    admin@aldia.com         / Admin12345    ADMINISTRADOR       Fusagasugá
--    corresponsal@aldia.com  / Usuario12345  nivel 3 (160 pts)   Soacha
--    activo@aldia.com        / Usuario12345  nivel 2 (60 pts)    Fusagasugá
--    vecina@aldia.com        / Usuario12345  nivel 1 (10 pts)    Fusagasugá
--    lector@aldia.com        / Usuario12345  nivel 1 (0 pts)     Zipaquirá
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Usuarios. El nivel sale del número (1, 2, 3) que agrega V3.
-- ---------------------------------------------------------------------------
INSERT INTO usuario (correo, contrasena_cifrada, nombre, rol, puntaje, ciudad_id, nivel_id)
SELECT v.correo, v.hash, v.nombre, v.rol, v.puntaje, c.id, n.id
  FROM (VALUES
    ('admin@aldia.com',        '$2a$10$I8tRdcDuR6qpisZFIOKCqehn9zMqH0jDyI.OURX5qFoYMr5DWZLee',
     'Administrador del portal', 'ADMINISTRADOR',   0, 'Fusagasugá', 1),
    ('corresponsal@aldia.com', '$2a$10$4ybrXfdwdQn2/fPIci1P9.A39myqPfgQx0rfcPneGW8qrE.hFWRfC',
     'María Corresponsal',       'USUARIO_COMUN', 160, 'Soacha',     3),
    ('activo@aldia.com',       '$2a$10$4ybrXfdwdQn2/fPIci1P9.A39myqPfgQx0rfcPneGW8qrE.hFWRfC',
     'Carlos Activo',            'USUARIO_COMUN',  60, 'Fusagasugá', 2),
    ('vecina@aldia.com',       '$2a$10$4ybrXfdwdQn2/fPIci1P9.A39myqPfgQx0rfcPneGW8qrE.hFWRfC',
     'Laura Vecina',             'USUARIO_COMUN',  10, 'Fusagasugá', 1),
    ('lector@aldia.com',       '$2a$10$4ybrXfdwdQn2/fPIci1P9.A39myqPfgQx0rfcPneGW8qrE.hFWRfC',
     'Andrés Lector',            'USUARIO_COMUN',   0, 'Zipaquirá',  1)
  ) AS v(correo, hash, nombre, rol, puntaje, ciudad, nivel)
  JOIN ciudad c ON c.nombre = v.ciudad AND c.departamento = 'Cundinamarca'
  JOIN nivel  n ON n.numero = v.nivel
ON CONFLICT (correo) DO NOTHING;

-- ---------------------------------------------------------------------------
--  Noticias: oficiales y comunitarias en varias ciudades, y una oculta para
--  comprobar que el listado público solo muestra las PUBLICADAS. Las fechas
--  son relativas al momento de cargar los datos, para que la portada se vea al día.
-- ---------------------------------------------------------------------------
INSERT INTO noticia (titulo, resumen, contenido, fecha_publicacion, oficial, estado,
                     latitud, longitud, usuario_id, ciudad_id)
SELECT v.titulo, v.resumen, v.contenido, CURRENT_TIMESTAMP - v.hace, v.oficial, v.estado,
       v.latitud, v.longitud, u.id, c.id
  FROM (VALUES
    ('Fusagasugá inaugura la nueva ciclorruta del centro',
     'La obra conecta el parque principal con la terminal y beneficia a más de veinte mil ciclistas.',
     'La administración municipal entregó este viernes los 4,2 kilómetros de ciclorruta que unen el parque principal con la terminal de transportes. La vía cuenta con señalización, iluminación y dos puntos de reparación gratuitos. Según la Secretaría de Movilidad, la obra beneficia a más de veinte mil personas que usan la bicicleta a diario.',
     INTERVAL '2 hours', TRUE, 'PUBLICADA', 4.33722000::NUMERIC, -74.36389000::NUMERIC,
     'admin@aldia.com', 'Fusagasugá'),
    ('Cortes de agua programados para este jueves',
     'La empresa de acueducto anunció mantenimiento en los barrios del sur entre las 8 a. m. y las 4 p. m.',
     'La empresa de acueducto informó que el próximo jueves suspenderá el servicio en catorce barrios del sur del municipio, entre las 8 de la mañana y las 4 de la tarde, por labores de mantenimiento en la red principal. Se recomienda almacenar agua con anticipación.',
     INTERVAL '1 day', TRUE, 'PUBLICADA', 4.57937000, -74.21682000,
     'admin@aldia.com', 'Soacha'),
    ('Abren las inscripciones para las escuelas deportivas',
     'Los cupos son gratuitos y están dirigidos a niños y jóvenes entre 6 y 17 años.',
     'El Instituto Municipal de Deporte abrió las inscripciones para las escuelas de formación en fútbol, baloncesto, natación y atletismo. Los cupos son gratuitos, están dirigidos a niños y jóvenes entre 6 y 17 años, y las clases comienzan la primera semana del próximo mes.',
     INTERVAL '2 days', TRUE, 'PUBLICADA', 5.02204000, -73.99578000,
     'admin@aldia.com', 'Zipaquirá'),
    ('Vecinos de La Esperanza reparan el parque por su cuenta',
     'Veinte familias se organizaron para pintar los juegos y arreglar la cancha del barrio.',
     'Durante el fin de semana, veinte familias del barrio La Esperanza se reunieron para pintar los juegos infantiles, reparar las mallas de la cancha y sembrar árboles en el parque. La jornada se organizó por un grupo de WhatsApp del barrio y los materiales se reunieron entre los vecinos.',
     INTERVAL '3 days', FALSE, 'PUBLICADA', 4.57937000, -74.21682000,
     'corresponsal@aldia.com', 'Soacha'),
    ('La feria gastronómica reunirá a cuarenta emprendedores',
     'El evento será este fin de semana en la plaza de mercado, con entrada libre.',
     'Cuarenta emprendedores de la región participarán en la feria gastronómica que se realizará el sábado y el domingo en la plaza de mercado. Habrá muestras de cocina tradicional, café de la zona y actividades para niños. La entrada es libre.',
     INTERVAL '4 days', FALSE, 'PUBLICADA', 4.86311000, -74.35540000,
     'corresponsal@aldia.com', 'Facatativá'),
    ('El mercado campesino vuelve a la plaza los domingos',
     'Más de treinta familias de las veredas venderán frutas, verduras y lácteos sin intermediarios.',
     'Desde este domingo, el mercado campesino regresa a la plaza principal de 7 de la mañana a 2 de la tarde. Más de treinta familias de las veredas cercanas venderán frutas, verduras, lácteos y panes artesanales directamente, sin intermediarios. Los organizadores piden llevar bolsas reutilizables.',
     INTERVAL '5 hours', FALSE, 'PUBLICADA', 4.34120000, -74.36210000,
     'activo@aldia.com', 'Fusagasugá'),
    ('Piden semáforo en el cruce del colegio departamental',
     'Padres de familia recogieron firmas para pedir un paso seguro a la salida de clases.',
     'Un grupo de padres de familia recogió más de cuatrocientas firmas para pedir a la alcaldía un semáforo y un reductor de velocidad en el cruce frente al colegio departamental. A la hora de salida de clases el tráfico es pesado y los niños cruzan sin señalización.',
     INTERVAL '8 hours', FALSE, 'PUBLICADA', 4.33990000, -74.36550000,
     'vecina@aldia.com', 'Fusagasugá'),
    ('Concierto de la banda sinfónica en la catedral de sal',
     'La presentación será gratuita y con aforo limitado; las boletas se reclaman en la Casa de la Cultura.',
     'La banda sinfónica municipal ofrecerá un concierto especial en la catedral de sal el próximo sábado a las 6 de la tarde. La entrada es gratuita, pero el aforo es limitado: las boletas se reclaman en la Casa de la Cultura desde el miércoles.',
     INTERVAL '30 hours', TRUE, 'PUBLICADA', 5.01880000, -74.01360000,
     'admin@aldia.com', 'Zipaquirá'),
    ('Publicación retirada por moderación',
     'Esta noticia está oculta y no debe aparecer en el listado.',
     'Contenido retirado por el administrador. Sirve para comprobar que el listado solo muestra las noticias en estado PUBLICADA.',
     INTERVAL '5 days', FALSE, 'OCULTA', NULL, NULL,
     'corresponsal@aldia.com', 'Chía')
  ) AS v(titulo, resumen, contenido, hace, oficial, estado, latitud, longitud, correo, ciudad)
  JOIN usuario u ON u.correo = v.correo
  JOIN ciudad  c ON c.nombre = v.ciudad AND c.departamento = 'Cundinamarca'
 WHERE NOT EXISTS (SELECT 1 FROM noticia n WHERE n.titulo = v.titulo);

-- ---------------------------------------------------------------------------
--  Notificación de ejemplo: a la vecina de Fusagasugá le llegó el aviso de la
--  ciclorruta, que es de su ciudad.
-- ---------------------------------------------------------------------------
INSERT INTO notificacion (mensaje, tipo, usuario_id, noticia_id)
SELECT 'Nueva noticia en Fusagasugá: Fusagasugá inaugura la nueva ciclorruta del centro',
       'CERCANIA', u.id, n.id
  FROM usuario u, noticia n
 WHERE u.correo = 'vecina@aldia.com'
   AND n.titulo = 'Fusagasugá inaugura la nueva ciclorruta del centro'
   AND NOT EXISTS (SELECT 1 FROM notificacion x WHERE x.usuario_id = u.id AND x.noticia_id = n.id);
