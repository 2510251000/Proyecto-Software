-- ============================================================================
--  Al Día: Portal de Noticias
--  V3 — lo que necesitan la ubicación, los niveles y las notificaciones
--
--  Escrita para correr tanto en una base nueva (después de V1 y V2) como en una
--  base creada antes con los scripts sueltos de database/ (Flyway la marca en
--  la versión 2 y empieza aquí). Por eso usa IF NOT EXISTS donde hace falta.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  ciudad: coordenadas e identificador del lugar que devuelve la API de
--  geocodificación (Google Maps o Nominatim). Así una ciudad que llega desde
--  la API se reconoce si vuelve a llegar.
-- ---------------------------------------------------------------------------
ALTER TABLE ciudad ADD COLUMN IF NOT EXISTS latitud  NUMERIC(10,8);
ALTER TABLE ciudad ADD COLUMN IF NOT EXISTS longitud NUMERIC(11,8);
ALTER TABLE ciudad ADD COLUMN IF NOT EXISTS id_lugar VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ciudad_id_lugar ON ciudad (id_lugar)
    WHERE id_lugar IS NOT NULL;

COMMENT ON COLUMN ciudad.id_lugar IS
    'Identificador del lugar en el proveedor: place_id de Google o osm:<tipo><id> de Nominatim.';

-- ---------------------------------------------------------------------------
--  nivel: número visible (1, 2, 3). Se calcula por el orden del puntaje
--  mínimo, así no depende de los id.
-- ---------------------------------------------------------------------------
ALTER TABLE nivel ADD COLUMN IF NOT EXISTS numero INTEGER;

UPDATE nivel n
   SET numero = o.posicion
  FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY puntaje_minimo) AS posicion FROM nivel) o
 WHERE n.id = o.id;

ALTER TABLE nivel ALTER COLUMN numero SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_nivel_numero ON nivel (numero);

-- ---------------------------------------------------------------------------
--  notificacion: la noticia de la que avisa y el tipo CERCANIA (noticia
--  nueva en la ciudad del usuario). En las bases nuevas ya vienen de V1.
-- ---------------------------------------------------------------------------
ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS noticia_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notificacion_noticia') THEN
        ALTER TABLE notificacion ADD CONSTRAINT fk_notificacion_noticia
            FOREIGN KEY (noticia_id) REFERENCES noticia (id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE notificacion DROP CONSTRAINT IF EXISTS ck_notificacion_tipo;
ALTER TABLE notificacion ADD CONSTRAINT ck_notificacion_tipo
    CHECK (tipo IN ('COMENTARIO', 'CALIFICACION', 'ASCENSO_NIVEL', 'MODERACION', 'CERCANIA'));

CREATE INDEX IF NOT EXISTS idx_notificacion_noticia ON notificacion (noticia_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_usuario ON notificacion (usuario_id, fecha DESC);

-- ---------------------------------------------------------------------------
--  historial: la moderación y los cambios de nivel también quedan en la bitácora.
-- ---------------------------------------------------------------------------
ALTER TABLE historial DROP CONSTRAINT IF EXISTS ck_historial_accion;
ALTER TABLE historial ADD CONSTRAINT ck_historial_accion
    CHECK (accion IN ('REGISTRO', 'INICIO_SESION', 'PUBLICACION', 'COMENTARIO',
                      'CALIFICACION', 'REPORTE', 'MODERACION', 'CAMBIO_NIVEL'));

-- Búsqueda de usuarios por ciudad para avisarles (solo cuentas activas).
CREATE INDEX IF NOT EXISTS idx_usuario_ciudad_activo ON usuario (ciudad_id) WHERE activo = TRUE;
