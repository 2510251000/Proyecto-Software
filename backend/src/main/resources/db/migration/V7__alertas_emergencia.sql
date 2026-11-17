-- ============================================================================
--  Al Día: Portal de Noticias
--  V7: alertas de emergencia (al estilo de la Alerta Amber).
--
--  Una alerta es una noticia marcada como urgente: una desaparición, un robo o
--  una emergencia. Al publicarla, todos los usuarios de la ciudad reciben una
--  notificación ALERTA que la aplicación muestra a pantalla completa, con sonido
--  y vibración, como los avisos de sismo de los celulares.
--
--  Vive en su propia tabla (1 a 1 con noticia) para no tocar la tabla noticia:
--  la noticia sigue teniendo sus fotos, su mapa y sus comentarios de siempre.
-- ============================================================================

CREATE TABLE alerta (
    noticia_id     BIGINT      PRIMARY KEY REFERENCES noticia (id) ON DELETE CASCADE,
    tipo           VARCHAR(20) NOT NULL,
    activa         BOOLEAN     NOT NULL DEFAULT TRUE,
    fecha_resuelta TIMESTAMP,
    CONSTRAINT ck_alerta_tipo CHECK (tipo IN ('DESAPARICION', 'ROBO', 'EMERGENCIA')),
    CONSTRAINT ck_alerta_resuelta CHECK (activa OR fecha_resuelta IS NOT NULL)
);

COMMENT ON TABLE alerta IS
    'Noticias urgentes (desaparición, robo, emergencia) que se avisan a pantalla completa en la ciudad.';
COMMENT ON COLUMN alerta.activa IS
    'FALSE cuando el autor o un administrador la marca como resuelta (por ejemplo, la persona apareció).';

CREATE INDEX idx_alerta_activa ON alerta (noticia_id) WHERE activa = TRUE;

ALTER TABLE notificacion DROP CONSTRAINT IF EXISTS ck_notificacion_tipo;
ALTER TABLE notificacion ADD CONSTRAINT ck_notificacion_tipo
    CHECK (tipo IN ('COMENTARIO', 'CALIFICACION', 'ASCENSO_NIVEL', 'MODERACION', 'CERCANIA', 'ALERTA'));
