-- ============================================================================
--  Al Día: Portal de Noticias
--  01-schema.sql — creación del esquema completo (10 tablas)
--
--  Universidad de Cundinamarca — Ingeniería de Software
--  Motor: PostgreSQL 14 o superior
--
--  Uso:  psql -U postgres -d aldia -f 01-schema.sql
--  Este script asume que la base de datos 'aldia' ya existe.
--
--  ADVERTENCIA: este script BORRA todas las tablas y todos sus datos antes de
--  crearlas de nuevo. Es solo para uso local; nunca se ejecuta en PRE ni PROD.
-- ============================================================================

-- En Windows psql usa la codificación de la consola (WIN1252) y daña las tildes.
SET client_encoding = 'UTF8';

-- Se borran las tablas en orden inverso a su creación para que las llaves
-- foráneas no impidan el borrado. Permite volver a correr el script desde cero.
DROP TABLE IF EXISTS historial      CASCADE;
DROP TABLE IF EXISTS notificacion   CASCADE;
DROP TABLE IF EXISTS multimedia     CASCADE;
DROP TABLE IF EXISTS reporte        CASCADE;
DROP TABLE IF EXISTS calificacion   CASCADE;
DROP TABLE IF EXISTS comentario     CASCADE;
DROP TABLE IF EXISTS noticia        CASCADE;
DROP TABLE IF EXISTS usuario        CASCADE;
DROP TABLE IF EXISTS nivel          CASCADE;
DROP TABLE IF EXISTS ciudad         CASCADE;


-- ============================================================================
--  CATÁLOGOS
--  Tablas de consulta. Cambian poco y las llena 02-datos-iniciales.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  ciudad — municipios donde ocurre y se publica la noticia
-- ---------------------------------------------------------------------------
CREATE TABLE ciudad (
    id_ciudad    BIGSERIAL    PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,

    -- Hay municipios con el mismo nombre en departamentos distintos, así que
    -- lo único que no se puede repetir es la pareja completa.
    CONSTRAINT uq_ciudad_nombre_departamento UNIQUE (nombre, departamento)
);

COMMENT ON TABLE ciudad IS
    'Catálogo de municipios. Nunca se escriben en el código de la aplicación.';


-- ---------------------------------------------------------------------------
--  nivel — niveles de usuario, con su puntaje y su límite de publicaciones
-- ---------------------------------------------------------------------------
CREATE TABLE nivel (
    id_nivel       BIGSERIAL   PRIMARY KEY,
    nombre         VARCHAR(50) NOT NULL UNIQUE,
    puntaje_minimo INTEGER     NOT NULL UNIQUE,
    limite_diario  INTEGER     NOT NULL,

    CONSTRAINT ck_nivel_puntaje_no_negativo CHECK (puntaje_minimo >= 0),
    CONSTRAINT ck_nivel_limite_positivo     CHECK (limite_diario  >  0)
);

COMMENT ON TABLE nivel IS
    'Niveles (Básico, Activo, Corresponsal Certificado) con su puntaje de '
    'entrada y su límite diario de publicaciones. Son datos, no constantes.';


-- ============================================================================
--  OPERACIÓN DIARIA
-- ============================================================================

-- ---------------------------------------------------------------------------
--  usuario — cuentas registradas (comunes y administradores)
--  Las cuentas no se borran: se desactivan con activo = FALSE.
-- ---------------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario     BIGSERIAL    PRIMARY KEY,
    correo         VARCHAR(150) NOT NULL UNIQUE,

    -- Guarda el hash BCrypt que genera el backend, nunca la contraseña en
    -- texto plano. BCrypt siempre produce 60 caracteres; 255 deja margen.
    contrasena     VARCHAR(255) NOT NULL,

    -- Opcionales: el registro solo pide correo y contraseña. Se completan
    -- después desde la pantalla de perfil.
    nombre         VARCHAR(100),
    id_ciudad      BIGINT,

    rol            VARCHAR(20)  NOT NULL DEFAULT 'USUARIO_COMUN',
    puntaje        INTEGER      NOT NULL DEFAULT 0,
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Todo usuario nuevo entra en el nivel 1 (Básico). Este DEFAULT depende de
    -- que 02-datos-iniciales.sql inserte 'Básico' primero.
    id_nivel       BIGINT       NOT NULL DEFAULT 1,

    CONSTRAINT ck_usuario_rol
        CHECK (rol IN ('USUARIO_COMUN', 'ADMINISTRADOR')),
    CONSTRAINT ck_usuario_puntaje_no_negativo
        CHECK (puntaje >= 0),

    CONSTRAINT fk_usuario_ciudad FOREIGN KEY (id_ciudad)
        REFERENCES ciudad (id_ciudad) ON DELETE RESTRICT,
    CONSTRAINT fk_usuario_nivel  FOREIGN KEY (id_nivel)
        REFERENCES nivel  (id_nivel)  ON DELETE RESTRICT
);

CREATE INDEX idx_usuario_ciudad ON usuario (id_ciudad);
CREATE INDEX idx_usuario_nivel  ON usuario (id_nivel);

COMMENT ON COLUMN usuario.contrasena IS
    'Hash BCrypt generado por el backend. Jamás texto plano.';
COMMENT ON COLUMN usuario.activo IS
    'FALSE = cuenta desactivada. Las cuentas se desactivan, no se borran.';


-- ---------------------------------------------------------------------------
--  noticia — publicaciones oficiales y de los habitantes
-- ---------------------------------------------------------------------------
CREATE TABLE noticia (
    id_noticia        BIGSERIAL    PRIMARY KEY,
    titulo            VARCHAR(200) NOT NULL,
    resumen           VARCHAR(500),
    contenido         TEXT         NOT NULL,
    fecha_publicacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- TRUE cuando la publica un administrador en nombre del portal.
    oficial           BOOLEAN      NOT NULL DEFAULT FALSE,
    estado            VARCHAR(20)  NOT NULL DEFAULT 'PUBLICADA',

    -- Ubicación que devuelve la API de Google Maps. Solo se guardan estos
    -- tres datos: ningún mapa ni contenido de Google se almacena aquí.
    latitud           NUMERIC(10,8),
    longitud          NUMERIC(11,8),
    id_lugar_google   VARCHAR(255),

    id_usuario        BIGINT       NOT NULL,
    id_ciudad         BIGINT       NOT NULL,

    CONSTRAINT ck_noticia_estado
        CHECK (estado IN ('PUBLICADA', 'OCULTA', 'ELIMINADA')),
    CONSTRAINT ck_noticia_latitud
        CHECK (latitud  IS NULL OR latitud  BETWEEN  -90 AND  90),
    CONSTRAINT ck_noticia_longitud
        CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),

    CONSTRAINT fk_noticia_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_noticia_ciudad  FOREIGN KEY (id_ciudad)
        REFERENCES ciudad  (id_ciudad)  ON DELETE RESTRICT
);

-- Sirve para buscar las noticias de un usuario y, con la fecha, para contar
-- cuántas publicó hoy (límite diario).
CREATE INDEX idx_noticia_usuario ON noticia (id_usuario, fecha_publicacion DESC);
CREATE INDEX idx_noticia_ciudad  ON noticia (id_ciudad);

-- El listado principal ordena por fecha descendente; este índice lo acelera.
CREATE INDEX idx_noticia_fecha   ON noticia (fecha_publicacion DESC);

COMMENT ON COLUMN noticia.id_lugar_google IS
    'place_id devuelto por la API de Google Maps. Solo el identificador.';


-- ---------------------------------------------------------------------------
--  comentario — opiniones de los usuarios sobre una noticia
-- ---------------------------------------------------------------------------
CREATE TABLE comentario (
    id_comentario BIGSERIAL PRIMARY KEY,
    contenido     TEXT      NOT NULL,
    fecha         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario    BIGINT    NOT NULL,
    id_noticia    BIGINT    NOT NULL,

    CONSTRAINT fk_comentario_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_noticia FOREIGN KEY (id_noticia)
        REFERENCES noticia (id_noticia) ON DELETE CASCADE
);

CREATE INDEX idx_comentario_usuario ON comentario (id_usuario);
CREATE INDEX idx_comentario_noticia ON comentario (id_noticia);


-- ---------------------------------------------------------------------------
--  calificacion — puntuación de 1 a 5 que un usuario le da a una noticia
-- ---------------------------------------------------------------------------
CREATE TABLE calificacion (
    id_calificacion BIGSERIAL PRIMARY KEY,
    valor           SMALLINT  NOT NULL,
    fecha           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario      BIGINT    NOT NULL,
    id_noticia      BIGINT    NOT NULL,

    CONSTRAINT ck_calificacion_valor CHECK (valor BETWEEN 1 AND 5),

    -- Un usuario califica una noticia una sola vez. Si cambia de opinión,
    -- el backend actualiza la fila que ya existe en lugar de insertar otra.
    CONSTRAINT uq_calificacion_usuario_noticia UNIQUE (id_usuario, id_noticia),

    CONSTRAINT fk_calificacion_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_calificacion_noticia FOREIGN KEY (id_noticia)
        REFERENCES noticia (id_noticia) ON DELETE CASCADE
);

CREATE INDEX idx_calificacion_noticia ON calificacion (id_noticia);


-- ---------------------------------------------------------------------------
--  reporte — denuncias de contenido, para que el administrador modere
-- ---------------------------------------------------------------------------
CREATE TABLE reporte (
    id_reporte  BIGSERIAL   PRIMARY KEY,
    motivo      VARCHAR(50) NOT NULL,
    descripcion TEXT,
    estado      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario  BIGINT      NOT NULL,
    id_noticia  BIGINT      NOT NULL,

    CONSTRAINT ck_reporte_motivo
        CHECK (motivo IN ('NOTICIA_FALSA', 'CONTENIDO_OFENSIVO',
                          'SPAM', 'OTRO')),
    CONSTRAINT ck_reporte_estado
        CHECK (estado IN ('PENDIENTE', 'REVISADO', 'DESCARTADO')),

    -- Un mismo usuario no reporta dos veces la misma noticia.
    CONSTRAINT uq_reporte_usuario_noticia UNIQUE (id_usuario, id_noticia),

    CONSTRAINT fk_reporte_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_reporte_noticia FOREIGN KEY (id_noticia)
        REFERENCES noticia (id_noticia) ON DELETE CASCADE
);

CREATE INDEX idx_reporte_noticia ON reporte (id_noticia);

-- El panel del administrador consulta los reportes pendientes. Este índice
-- parcial solo guarda esas filas, así que es pequeño y rápido.
CREATE INDEX idx_reporte_pendiente ON reporte (fecha DESC)
    WHERE estado = 'PENDIENTE';


-- ---------------------------------------------------------------------------
--  multimedia — imágenes y videos que acompañan a una noticia
-- ---------------------------------------------------------------------------
CREATE TABLE multimedia (
    id_multimedia BIGSERIAL    PRIMARY KEY,
    url           VARCHAR(500) NOT NULL,
    tipo          VARCHAR(20)  NOT NULL,
    orden         SMALLINT     NOT NULL DEFAULT 1,
    id_noticia    BIGINT       NOT NULL,

    CONSTRAINT ck_multimedia_tipo  CHECK (tipo IN ('IMAGEN', 'VIDEO')),
    CONSTRAINT ck_multimedia_orden CHECK (orden > 0),

    CONSTRAINT fk_multimedia_noticia FOREIGN KEY (id_noticia)
        REFERENCES noticia (id_noticia) ON DELETE CASCADE
);

CREATE INDEX idx_multimedia_noticia ON multimedia (id_noticia);

COMMENT ON COLUMN multimedia.orden IS
    'Posición del archivo dentro de la noticia. La 1 se usa como portada.';


-- ---------------------------------------------------------------------------
--  notificacion — avisos dirigidos a un usuario
-- ---------------------------------------------------------------------------
CREATE TABLE notificacion (
    id_notificacion BIGSERIAL    PRIMARY KEY,
    mensaje         VARCHAR(300) NOT NULL,
    tipo            VARCHAR(30)  NOT NULL,
    leida           BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario      BIGINT       NOT NULL,

    CONSTRAINT ck_notificacion_tipo
        CHECK (tipo IN ('COMENTARIO', 'CALIFICACION',
                        'ASCENSO_NIVEL', 'MODERACION')),

    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE
);

-- La campanita del portal pide las no leídas de un usuario.
CREATE INDEX idx_notificacion_no_leidas ON notificacion (id_usuario, fecha DESC)
    WHERE leida = FALSE;


-- ---------------------------------------------------------------------------
--  historial — bitácora de las acciones de cada usuario
-- ---------------------------------------------------------------------------
CREATE TABLE historial (
    id_historial BIGSERIAL   PRIMARY KEY,
    accion       VARCHAR(50) NOT NULL,
    detalle      VARCHAR(300),
    fecha        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario   BIGINT      NOT NULL,

    CONSTRAINT ck_historial_accion
        CHECK (accion IN ('REGISTRO', 'INICIO_SESION', 'PUBLICACION',
                          'COMENTARIO', 'CALIFICACION', 'REPORTE')),

    CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_historial_usuario ON historial (id_usuario, fecha DESC);

COMMENT ON TABLE historial IS
    'Bitácora de actividad del usuario. No se usa para el límite diario: ese '
    'límite se calcula contando las noticias del usuario cuya '
    'noticia.fecha_publicacion es de hoy.';
